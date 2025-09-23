# Sitio creado para promover Webex Contact Center

Sitio web promocional para comunicar los beneficios de Comunicaciones Unificadas y Webex Contact Center

## Estructura
```
css/styles.css
js/app.js
images/
```

## Contacto
- Email: Jhon.Romero@tigo.com.co


Webex Callback Backend
Este repositorio contiene un backend Node.js/Express para integrar Webex Contact Center con un botón de Web Callback en tu sitio web. 

Permite:
- Generar Access Tokens dinámicos desde una Integration App (OAuth).
- Solicitar llamadas a Webex Contact Center hacia un número externo ingresado por el visitante.
- Generar Guest Tokens para usuarios externos (opcional).

Este backend está diseñado para ser desplegado en Render.com u otro servicio similar.

ESTRUCTURA
/backend
  /routes
    callback.js   → Endpoint para enviar llamadas a Webex CC
    guest.js      → Endpoint para generar Guest Tokens
    token.js      → Endpoint para refrescar Access Token de Integration App
    oauth.js      → Flujo OAuth de Integration App (generación de refresh_token)
  /utils
    tokenHelper.js → Lógica para cachear y renovar Access Token dinámico
server.js         → Punto de entrada del backend (Render)

ARCHIVOS:
server.js:
  Configura Express y las rutas del backend.
  Escucha el puerto definido por Render (process.env.PORT) o 10000 por defecto.
  Rutas disponibles:
    /guest → guest.js
    /callback → callback.jS
    /token → token.js
    /oauth → oauth.js

callback.js: (Endpoint: POST /callback/call)
  Obtiene Access Token dinámico usando tokenHelper.js.
  Llama al endpoint de Webex Contact Center (WXCC_API_URL) con entryPointId de la cola.
  Devuelve JSON con el resultado de la solicitud de callback.

token.js: (Endpoint: GET /token/refresh)
  Usa refresh_token de la Integration App para generar un nuevo Access Token.
  Guarda el token en memoria hasta que expire.
  Devuelve JSON con access_token, expires_in y opcionalmente refresh_token (solo para pruebas)

tokenHelper.js: (Función exportada: getAccessToken())
  Verifica si existe token válido en memoria.
  Si expira o no existe, solicita un nuevo token a Webex usando refresh_token.
  Retorna access_token listo para usar en callback.js.

guest.js: (POST /guest/token)
  Genera Guest Tokens para usuarios externos sin cuenta Webex
  Devuelve JSON con access_token para WebRTC.

oauth.js: (flujo completo de OAuth de Integration App)
    /oauth/start → redirige a Webex para autorización.
    /oauth/callback → recibe code, intercambia por access_token y refresh_token
  Útil para obtener REFRESH_TOKEN inicial.
