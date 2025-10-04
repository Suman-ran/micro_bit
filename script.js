let bluetoothDevice, uartCharacteristic;

async function connect() {
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'BBC micro:bit' }],
      optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] // Nordic UART
    });

    const server = await bluetoothDevice.gatt.connect();
    const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');

    // ✅ RX characteristic (where we write to send commands)
    uartCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

    alert("✅ Connected to Micro:bit!");
  } catch (error) {
    console.error(error);
    alert("❌ Connection failed: " + error);
  }
}

async function sendCommand(cmd) {
  if (!uartCharacteristic) {
    console.warn("⚠️ Not connected!");
    return;
  }
  let encoder = new TextEncoder();
  try {
    await uartCharacteristic.writeValue(encoder.encode(cmd + "\n"));
    console.log("Sent:", cmd);
  } catch (error) {
    console.error("Write error:", error);
  }
}

// 📌 Helper: Add press-and-hold behavior
function bindHoldButton(id, command) {
  const btn = document.getElementById(id);

  btn.addEventListener("mousedown", () => sendCommand(command));
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault(); // prevent scrolling on touch
    sendCommand(command);
  });

  btn.addEventListener("mouseup", () => sendCommand("stop"));
  btn.addEventListener("mouseleave", () => sendCommand("stop"));
  btn.addEventListener("touchend", () => sendCommand("stop"));
  btn.addEventListener("touchcancel", () => sendCommand("stop"));
}

// Init event bindings
document.getElementById("connectBtn").addEventListener("click", connect);

bindHoldButton("up", "up");
bindHoldButton("down", "down");
bindHoldButton("left", "left");
bindHoldButton("right", "right");

// Stop button works with click
document.getElementById("stop").addEventListener("click", () => sendCommand("stop"));