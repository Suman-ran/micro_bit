let bluetoothDevice, uartCharacteristic;

async function connect() {
  if (!navigator.bluetooth) {
    alert("Web Bluetooth not available. Use Chrome on mobile or desktop.");
    return;
  }

  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'BBC micro:bit' }],
      optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
    });

    const server = await bluetoothDevice.gatt.connect();
    const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');

    uartCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');
    alert("✅ Connected to Micro:bit!");
  } catch (error) {
    console.error(error);
    alert("❌ Connection failed: " + error);
  }
}

async function sendCommand(cmd) {
  if (!uartCharacteristic) return;
  let encoder = new TextEncoder();
  try {
    await uartCharacteristic.writeValue(encoder.encode(cmd + "\n"));
    console.log("Sent:", cmd);
  } catch (error) {
    console.error("Write error:", error);
  }
}

function bindHoldButton(id, command) {
  const btn = document.getElementById(id);
  btn.addEventListener("mousedown", () => sendCommand(command));
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    sendCommand(command);
  });
  btn.addEventListener("mouseup", () => sendCommand("stop"));
  btn.addEventListener("mouseleave", () => sendCommand("stop"));
  btn.addEventListener("touchend", () => sendCommand("stop"));
  btn.addEventListener("touchcancel", () => sendCommand("stop"));
}

// Init
document.getElementById("connectBtn").addEventListener("click", connect);
bindHoldButton("up", "up");
bindHoldButton("down", "down");
bindHoldButton("left", "left");
bindHoldButton("right", "right");
document.getElementById("stop").addEventListener("click", () => sendCommand("stop"));
