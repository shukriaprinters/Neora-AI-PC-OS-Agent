import EventEmitter from 'events';
import { spawn } from 'child_process';
import os from 'os';

export interface FeedbackMessage {
  id: string;
  text: string;
  type: 'confirmation' | 'execution' | 'error' | 'success' | 'notification';
  timestamp: Date;
  voiceEnabled: boolean;
  textEnabled: boolean;
}

class VoiceFeedback extends EventEmitter {
  private isWindows: boolean;
  private isMac: boolean;
  private isLinux: boolean;
  private voiceEnabled: boolean = true;
  private voice: string = 'default';
  private rate: number = 1.0;
  private volume: number = 1.0;
  private feedbackHistory: FeedbackMessage[] = [];
  private maxHistorySize: number = 100;

  constructor() {
    super();
    const platform = os.platform();
    this.isWindows = platform === 'win32';
    this.isMac = platform === 'darwin';
    this.isLinux = platform === 'linux';
  }

  async speak(text: string, type: FeedbackMessage['type'] = 'notification'): Promise<void> {
    const id = `feedback-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const message: FeedbackMessage = {
      id,
      text,
      type,
      timestamp: new Date(),
      voiceEnabled: this.voiceEnabled,
      textEnabled: true,
    };

    // Store in history
    this.feedbackHistory.push(message);
    if (this.feedbackHistory.length > this.maxHistorySize) {
      this.feedbackHistory.shift();
    }

    // Emit text message for UI display
    this.emit('feedback:text', message);

    // If voice is disabled, just return
    if (!this.voiceEnabled) {
      return;
    }

    try {
      await this.synthesizeVoice(text);
      this.emit('feedback:spoken', message);
    } catch (error: any) {
      console.error('[VoiceFeedback] Failed to speak:', error.message);
      this.emit('feedback:error', {
        id,
        text: `Failed to speak: ${error.message}`,
        type: 'error' as const,
        timestamp: new Date(),
        voiceEnabled: false,
        textEnabled: true,
      });
    }
  }

  private async synthesizeVoice(text: string): Promise<void> {
    if (this.isWindows) {
      await this.windowsTTS(text);
    } else if (this.isMac) {
      await this.macTTS(text);
    } else if (this.isLinux) {
      await this.linuxTTS(text);
    }
  }

  private windowsTTS(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const escapedText = text.replace(/"/g, '""');
      const psScript = `
        Add-Type -AssemblyName System.Speech
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
        $speak.Rate = ${this.rate}
        $speak.Volume = ${this.volume * 100}
        $speak.Speak("${escapedText}")
      `;

      const proc = spawn('powershell', ['-Command', psScript]);

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`PowerShell TTS failed with code ${code}`));
        }
      });

      proc.on('error', reject);
    });
  }

  private macTTS(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('say', [
        '-r',
        (this.rate * 200).toString(),
        text,
      ]);

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`macOS TTS failed with code ${code}`));
        }
      });

      proc.on('error', reject);
    });
  }

  private linuxTTS(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Try espeak first
      const proc = spawn('espeak', [
        '-s',
        (150 * this.rate).toString(),
        '-a',
        (200 * this.volume).toString(),
        text,
      ]);

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          // Fallback: try festival
          const fallback = spawn('festival', ['--tts'], { stdio: 'pipe' });
          fallback.stdin.write(text);
          fallback.stdin.end();

          fallback.on('close', (fallbackCode) => {
            if (fallbackCode === 0) {
              resolve();
            } else {
              reject(new Error('No TTS engine available (espeak or festival required)'));
            }
          });

          fallback.on('error', reject);
        }
      });

      proc.on('error', () => {
        // Fallback handling happens above
      });
    });
  }

  async speakConfirmation(message: string, options: number = 5): Promise<void> {
    const fullMessage = `${message} Say yes to confirm or no to cancel. You have ${options} seconds.`;
    await this.speak(fullMessage, 'confirmation');
  }

  async speakCommandUnderstand(command: string, confidence: number): Promise<void> {
    const message = `I understood: ${command}. Confidence: ${(confidence * 100).toFixed(0)}%`;
    await this.speak(message, 'notification');
  }

  async speakCommandExecuting(command: string, estimatedTime: number): Promise<void> {
    const timeInfo =
      estimatedTime > 1000
        ? ` This should take about ${Math.round(estimatedTime / 1000)} seconds.`
        : '';
    const message = `Executing: ${command}.${timeInfo}`;
    await this.speak(message, 'execution');
  }

  async speakSuccess(message: string): Promise<void> {
    await this.speak(message, 'success');
  }

  async speakError(message: string): Promise<void> {
    await this.speak(message, 'error');
  }

  setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled;
    this.emit('voice:toggle', enabled);
  }

  isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  setRate(rate: number): void {
    // Clamp between 0.5 and 2.0
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  setVolume(volume: number): void {
    // Clamp between 0 and 1
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setVoice(voice: string): void {
    this.voice = voice;
  }

  getRate(): number {
    return this.rate;
  }

  getVolume(): number {
    return this.volume;
  }

  getVoice(): string {
    return this.voice;
  }

  getHistory(): FeedbackMessage[] {
    return [...this.feedbackHistory];
  }

  clearHistory(): void {
    this.feedbackHistory = [];
  }

  setHistorySize(size: number): void {
    this.maxHistorySize = size;
    if (this.feedbackHistory.length > size) {
      this.feedbackHistory = this.feedbackHistory.slice(-size);
    }
  }
}

export default new VoiceFeedback();
