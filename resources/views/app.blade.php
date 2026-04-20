<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>SecureVault - Encrypted File System</title>

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="antialiased">
        <div id="app">
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #666; background: #f9f9f9;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">SecureVault</div>
                <div>Initializing secure identity environment...</div>
                <div id="debug-status" style="margin-top: 20px; font-size: 12px; color: #999;">Waiting for JavaScript assets...</div>
            </div>
        </div>
    </body>
</html>
