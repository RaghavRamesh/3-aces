// html skeleton provider
export default function template(content = "", initialState) {
  const scripts = `<script src="/socket.io/socket.io.js"></script>
                  <script>
                    window.__STATE__ = ${JSON.stringify(initialState)}
                    var socket = io();
                    window.__SOCKET__ = socket;
                  </script>
                  <script src="assets/client.js"></script>
                  `
  const page = `<!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <title>3 Aces</title>
                  <link rel="stylesheet" href="assets/style.css">
                </head>
                <body>
                  <div id="app">
                    ${content}
                  </div>
                  ${scripts}
                </body>
                </html>
                `;

  return page;
}
