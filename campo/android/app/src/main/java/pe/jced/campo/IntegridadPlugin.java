package pe.jced.campo;

import android.Manifest;
import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.CancellationSignal;
import android.os.Handler;
import android.os.Looper;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.ECGenParameterSpec;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Integridad del marcaje (sección 6 del contexto):
 *  - Llave ECDSA P-256 en Android Keystore (StrongBox si existe). La privada nunca sale del equipo.
 *  - Ubicación de UNA sola lectura, informando si proviene de una app de GPS falso (mock).
 *  - Señales de root y emulador.
 * El celular solo REPORTA: quien decide si el marcaje es válido es el servidor.
 */
@CapacitorPlugin(
        name = "Integridad",
        permissions = {
                @Permission(alias = "ubicacion", strings = {Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION})
        })
public class IntegridadPlugin extends Plugin {

    private static final String ALIAS = "jced-campo-llave";
    private static final long TIEMPO_MAX_GPS_MS = 25_000;

    // ─── Llave del dispositivo ──────────────────────────────────────────────

    @PluginMethod
    public void clavePublica(PluginCall call) {
        try {
            PublicKey publica = asegurarLlave().getCertificate(ALIAS).getPublicKey();
            JSObject r = new JSObject();
            r.put("spki", Base64.encodeToString(publica.getEncoded(), Base64.NO_WRAP));
            r.put("modelo", (Build.MANUFACTURER + " " + Build.MODEL).trim());
            call.resolve(r);
        } catch (Exception e) {
            call.reject("No se pudo preparar la llave del celular", e);
        }
    }

    @PluginMethod
    public void firmar(PluginCall call) {
        String mensaje = call.getString("mensaje");
        if (mensaje == null) {
            call.reject("Falta el mensaje");
            return;
        }
        try {
            PrivateKey privada = (PrivateKey) asegurarLlave().getKey(ALIAS, null);
            Signature s = Signature.getInstance("SHA256withECDSA");
            s.initSign(privada);
            s.update(mensaje.getBytes(StandardCharsets.UTF_8));
            JSObject r = new JSObject();
            r.put("firma", Base64.encodeToString(s.sign(), Base64.NO_WRAP)); // DER
            call.resolve(r);
        } catch (Exception e) {
            call.reject("No se pudo firmar", e);
        }
    }

    private KeyStore asegurarLlave() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
        ks.load(null);
        if (ks.containsAlias(ALIAS)) return ks;
        try {
            generar(true);
        } catch (Exception sinStrongBox) {
            generar(false);
        }
        ks.load(null);
        return ks;
    }

    private void generar(boolean strongBox) throws Exception {
        KeyGenParameterSpec.Builder b = new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_SIGN)
                .setAlgorithmParameterSpec(new ECGenParameterSpec("secp256r1"))
                .setDigests(KeyProperties.DIGEST_SHA256);
        if (strongBox && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) b.setIsStrongBoxBacked(true);
        KeyPairGenerator g = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore");
        g.initialize(b.build());
        g.generateKeyPair(); // sin StrongBox lanza StrongBoxUnavailableException y asegurarLlave() reintenta sin él
    }

    // ─── Ubicación (una sola lectura, con detección de mock) ────────────────

    @PluginMethod
    public void ubicacion(PluginCall call) {
        if (getPermissionState("ubicacion") != PermissionState.GRANTED) {
            requestPermissionForAlias("ubicacion", call, "trasPermisoUbicacion");
            return;
        }
        leerUbicacion(call);
    }

    @PermissionCallback
    private void trasPermisoUbicacion(PluginCall call) {
        if (getPermissionState("ubicacion") == PermissionState.GRANTED) leerUbicacion(call);
        else call.reject("Activa el permiso de ubicación para marcar");
    }

    @SuppressWarnings({"MissingPermission", "deprecation"})
    private void leerUbicacion(PluginCall call) {
        LocationManager lm = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        String proveedor = lm.isProviderEnabled(LocationManager.GPS_PROVIDER) ? LocationManager.GPS_PROVIDER
                : lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER) ? LocationManager.NETWORK_PROVIDER : null;
        if (proveedor == null) {
            call.reject("Enciende el GPS del celular para marcar");
            return;
        }
        AtomicBoolean listo = new AtomicBoolean(false);
        Handler h = new Handler(Looper.getMainLooper());
        CancellationSignal cancelar = new CancellationSignal();

        Runnable alVencer = () -> {
            if (listo.compareAndSet(false, true)) {
                cancelar.cancel();
                call.reject("El GPS tardó demasiado. Sal a cielo abierto e inténtalo de nuevo");
            }
        };
        h.postDelayed(alVencer, TIEMPO_MAX_GPS_MS);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            lm.getCurrentLocation(proveedor, cancelar, getContext().getMainExecutor(), loc -> {
                if (loc != null && listo.compareAndSet(false, true)) {
                    h.removeCallbacks(alVencer);
                    call.resolve(aJson(loc));
                } else if (loc == null && listo.compareAndSet(false, true)) {
                    h.removeCallbacks(alVencer);
                    call.reject("No se pudo obtener tu ubicación");
                }
            });
        } else {
            lm.requestSingleUpdate(proveedor, new LocationListener() {
                @Override
                public void onLocationChanged(Location loc) {
                    if (listo.compareAndSet(false, true)) {
                        h.removeCallbacks(alVencer);
                        call.resolve(aJson(loc));
                    }
                }
            }, Looper.getMainLooper());
        }
    }

    @SuppressWarnings("deprecation")
    private static JSObject aJson(Location loc) {
        boolean mock = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? loc.isMock() : loc.isFromMockProvider();
        JSObject r = new JSObject();
        r.put("lat", loc.getLatitude());
        r.put("lng", loc.getLongitude());
        r.put("precision", loc.hasAccuracy() ? loc.getAccuracy() : 9999);
        r.put("mock", mock);
        return r;
    }

    // ─── Root / emulador ────────────────────────────────────────────────────

    @PluginMethod
    public void estado(PluginCall call) {
        JSObject r = new JSObject();
        r.put("root", esRoot());
        r.put("emulador", esEmulador());
        call.resolve(r);
    }

    private static boolean esRoot() {
        String tags = Build.TAGS;
        if (tags != null && tags.contains("test-keys")) return true;
        String[] rutas = {"/system/app/Superuser.apk", "/sbin/su", "/system/bin/su", "/system/xbin/su", "/data/local/xbin/su",
                "/data/local/bin/su", "/system/sd/xbin/su", "/system/bin/failsafe/su", "/data/local/su", "/su/bin/su",
                "/data/adb/magisk", "/sbin/.magisk"};
        for (String r : rutas) if (new File(r).exists()) return true;
        return false;
    }

    private static boolean esEmulador() {
        return Build.FINGERPRINT.startsWith("generic") || Build.FINGERPRINT.contains("emulator")
                || Build.MODEL.contains("google_sdk") || Build.MODEL.contains("Emulator") || Build.MODEL.contains("Android SDK built for")
                || Build.HARDWARE.contains("goldfish") || Build.HARDWARE.contains("ranchu")
                || Build.PRODUCT.contains("sdk_gphone") || Build.PRODUCT.contains("emulator");
    }
}
