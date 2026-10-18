package pe.jced.campo;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // El plugin propio debe registrarse antes de iniciar el puente.
        registerPlugin(IntegridadPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
