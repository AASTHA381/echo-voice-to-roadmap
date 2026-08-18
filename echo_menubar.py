import os
import sys
import time
import threading
import tempfile
import requests
import rumps

# Standard audio libraries
try:
    import sounddevice as sd
    import soundfile as sf
    import numpy as np
except ImportError:
    print("Missing dependencies. Run: pip install sounddevice soundfile numpy requests rumps")
    sys.exit(1)

class EchoMenuBarApp(rumps.App):
    def __init__(self):
        super(EchoMenuBarApp, self).__init__("🎙️ Echo", icon=None, template=True)
        
        # Default Server URL
        self.server_url = "https://echo-voice-to-roadmap-pgtn.onrender.com"
        
        # Recording States
        self.is_recording = False
        self.recording_thread = None
        self.sample_rate = 44100
        self.temp_file = None
        
        # Menu Setup
        self.menu = [
            rumps.MenuItem("Start Recording", callback=self.toggle_recording, key="R"),
            rumps.MenuItem("Cancel Recording", callback=self.cancel_recording),
            None, # Separator
            rumps.MenuItem("Set Backend URL...", callback=self.configure_settings),
            None
        ]
        self.menu["Cancel Recording"].set_callback(None) # disable initially

    def notify_macos(self, title, subtitle, message):
        """Sends native macOS desktop notification"""
        os.system(f"osascript -e 'display notification \"{message}\" with title \"{title}\" subtitle \"{subtitle}\" sound name \"Glass\"'")

    def configure_settings(self, sender):
        """Opens prompt to configure Render backend URL"""
        window = rumps.Window("Echo Settings", "Enter your Echo backend URL:", default_text=self.server_url, cancel=True)
        window.icon = None
        response = window.run()
        if response.clicked:
            url = response.text.strip()
            if url.endswith('/'):
                url = url[:-1]
            self.server_url = url
            self.notify_macos("Echo Settings", "Configuration Updated", f"Backend set to: {self.server_url}")

    def toggle_recording(self, sender):
        if not self.is_recording:
            # Start Recording
            self.is_recording = True
            self.title = "🔴 Rec"
            self.menu["Start Recording"].title = "Stop & Upload"
            self.menu["Cancel Recording"].set_callback(self.cancel_recording)
            
            # Start background recording thread
            self.temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            self.recording_thread = threading.Thread(target=self.record_loop)
            self.recording_thread.start()
            
            self.notify_macos("Echo", "Recording Started", "Listening to system microphone...")
        else:
            # Stop Recording
            self.is_recording = False
            self.title = "⏳ Uploading"
            self.menu["Start Recording"].title = "Start Recording"
            self.menu["Cancel Recording"].set_callback(None)
            
            # Join thread to make sure writing is complete
            if self.recording_thread:
                self.recording_thread.join()
                
            self.notify_macos("Echo", "Recording Stopped", "Finalizing audio file...")
            
            # Trigger upload in background so UI remains responsive
            threading.Thread(target=self.upload_audio).start()

    def cancel_recording(self, sender):
        if self.is_recording:
            self.is_recording = False
            self.title = "🎙️ Echo"
            self.menu["Start Recording"].title = "Start Recording"
            self.menu["Cancel Recording"].set_callback(None)
            
            if self.recording_thread:
                self.recording_thread.join()
                
            # Cleanup temp file
            if self.temp_file and os.path.exists(self.temp_file.name):
                os.remove(self.temp_file.name)
                
            self.notify_macos("Echo", "Recording Cancelled", "Audio data discarded.")

    def record_loop(self):
        """Asynchronous recording thread"""
        try:
            # Open sounddevice InputStream
            with sd.InputStream(samplerate=self.sample_rate, channels=1, dtype='float32') as stream:
                with sf.SoundFile(self.temp_file.name, mode='x', samplerate=self.sample_rate, channels=1) as file:
                    while self.is_recording:
                        data, overflowed = stream.read(1024)
                        file.write(data)
                        time.sleep(0.01)
        except Exception as e:
            self.is_recording = False
            self.title = "🎙️ Echo"
            self.notify_macos("Echo Error", "Recording Failed", str(e))

    def upload_audio(self):
        """Asynchronous upload thread"""
        try:
            filename = f"Mac_Meeting_{int(time.time())}.wav"
            files = {'file': (filename, open(self.temp_file.name, 'rb'), 'audio/wav')}
            
            # Post to FastAPI
            response = requests.post(f"{self.server_url}/api/upload", files=files, timeout=60)
            
            # Clean up temp file
            if os.path.exists(self.temp_file.name):
                os.remove(self.temp_file.name)
            
            if response.status_code == 200:
                self.title = "🎙️ Echo"
                self.notify_macos("Echo Upload", "Success 🎉", "Audio uploaded, transcribed and indexed.")
                # Open browser
                os.system("open https://echo-voice-to-roadmap-aastha381.vercel.app")
            else:
                self.title = "🎙️ Echo"
                self.notify_macos("Echo Upload Failed", f"HTTP {response.status_code}", response.text[:100])
        except Exception as e:
            self.title = "🎙️ Echo"
            self.notify_macos("Echo Upload Error", "Connection Failed", str(e))

if __name__ == "__main__":
    app = EchoMenuBarApp()
    app.run()
