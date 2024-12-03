import { config } from '@config/env';

interface CanvasInputs {
  streamCanvas: HTMLCanvasElement;
  imageTextCanvas: HTMLCanvasElement;
  drawCanvas: HTMLCanvasElement;
  interactionCanvas: HTMLCanvasElement;
  containerWidth: number;
  containerHeight: number;
}

export class WebRTCStream {
  private pc: RTCPeerConnection | null;
  private stream: MediaStream | null;
  private webrtcUrl: string;
  private streamKey: string;
  private compositeCanvas: HTMLCanvasElement;
  private animationFrameId: number | null;
  private canvasInputs: CanvasInputs | null;
  private isConnecting: boolean = false;
  private senders: {
    video: RTCRtpSender | null;
    audio: RTCRtpSender[];
  } = { video: null, audio: [] };

  constructor(url: string, streamKey: string) {
    this.webrtcUrl = url;
    this.streamKey = streamKey;
    this.pc = null;
    this.stream = null;
    this.animationFrameId = null;
    this.canvasInputs = null;
    this.compositeCanvas = document.createElement('canvas');

    const ctx = this.compositeCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
    }
  }

  private updateCompositeCanvas = () => {
    if (!this.canvasInputs) {
      return;
    }

    const { streamCanvas, imageTextCanvas, drawCanvas, interactionCanvas, containerWidth, containerHeight } =
      this.canvasInputs;

    const ctx = this.compositeCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const scale = window.devicePixelRatio;
    this.compositeCanvas.width = Math.floor(containerWidth * scale);
    this.compositeCanvas.height = Math.floor(containerHeight * scale);

    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, containerWidth, containerHeight);

    try {
      ctx.drawImage(streamCanvas, 0, 0, containerWidth, containerHeight);
      ctx.drawImage(imageTextCanvas, 0, 0, containerWidth, containerHeight);
      ctx.drawImage(drawCanvas, 0, 0, containerWidth, containerHeight);
      ctx.drawImage(interactionCanvas, 0, 0, containerWidth, containerHeight);
    } catch (error) {
      console.error('Error compositing canvas layers:', error);
    }

    this.animationFrameId = requestAnimationFrame(this.updateCompositeCanvas);
  };

  private async initializeConnection() {
    if (this.pc) return;

    this.pc = new RTCPeerConnection({
      iceServers: [],
    });

    this.pc.onconnectionstatechange = () => {
      if (this.pc?.connectionState === 'failed') {
        this.cleanup();
      }
    };

    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const whipEndpoint = config.whipUrl;
      const streamUrl = `${this.webrtcUrl}/${this.streamKey}`;

      const response = await fetch(whipEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api: whipEndpoint,
          streamurl: streamUrl,
          sdp: offer.sdp,
        }),
      });

      const jsonResponse = await response.json();

      if (jsonResponse.code !== 0 || !jsonResponse.sdp) {
        throw new Error(`WHIP Error: ${JSON.stringify(jsonResponse)}`);
      }

      await this.pc.setRemoteDescription(
        new RTCSessionDescription({
          type: 'answer',
          sdp: jsonResponse.sdp,
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  private async updateStreamTracks(videoTrack: MediaStreamTrack | null, audioTracks: MediaStreamTrack[]) {
    if (!this.pc) return;

    if (videoTrack) {
      if (this.senders.video) {
        await this.senders.video.replaceTrack(videoTrack);
      } else {
        this.senders.video = this.pc.addTrack(videoTrack);
      }
    }

    const currentAudioTracks = this.senders.audio.map(sender => sender.track);
    const newAudioTracks = audioTracks;

    for (const sender of this.senders.audio) {
      if (!newAudioTracks.includes(sender.track!)) {
        this.pc.removeTrack(sender);
      }
    }

    for (const track of newAudioTracks) {
      if (!currentAudioTracks.includes(track)) {
        this.senders.audio.push(this.pc.addTrack(track));
      }
    }

    this.senders.audio = this.senders.audio.filter(sender => newAudioTracks.includes(sender.track!));
  }

  async start(canvasInputs: CanvasInputs, screenStream: MediaStream | null, mediaStream: MediaStream | null) {
    if (this.isConnecting) return;

    try {
      this.isConnecting = true;
      this.canvasInputs = canvasInputs;

      const videoStream = this.compositeCanvas.captureStream(30);
      const videoTrack = videoStream.getVideoTracks()[0];

      if (!videoTrack) {
        throw new Error('No video track available from canvas');
      }

      const audioTracks: MediaStreamTrack[] = [];
      if (screenStream) {
        audioTracks.push(...screenStream.getAudioTracks());
      }
      if (mediaStream) {
        audioTracks.push(...mediaStream.getAudioTracks());
      }

      if (!this.pc) {
        await this.initializeConnection();
        this.animationFrameId = requestAnimationFrame(this.updateCompositeCanvas);
      }

      await this.updateStreamTracks(videoTrack, audioTracks);
    } catch (error) {
      console.error('Failed to start/update stream:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private async cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.pc) {
      const senders = this.pc.getSenders();
      for (const sender of senders) {
        this.pc.removeTrack(sender);
      }

      this.pc.close();
      this.pc = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    this.canvasInputs = null;
  }

  stop() {
    this.cleanup();
  }
}
