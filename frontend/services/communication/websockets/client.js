export default class WSClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
  }

  connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("WebSocket opened:", this.url);
      this.onOpen && this.onOpen();
    };

    this.ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }
      this.onMessage && this.onMessage(data);
    };

    this.ws.onclose = () => {
      console.log("WebSocket closed");
      this.onClose && this.onClose();
    };

    this.ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      this.onError && this.onError(err);
    };
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = typeof data === "string" ? data : JSON.stringify(data);
      this.ws.send(msg);
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
