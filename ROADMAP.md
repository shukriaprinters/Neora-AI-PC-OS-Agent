# Neora X7 OS Agent System Roadmap

This roadmap outlines the journey of Neora X7 from a pure conceptual workspace into a fully functioning local PC controller.

## 🏆 Current Phase Completed (Stable & Real)
We have successfully finished the core integration for the local system control:
1. **Local Python Control Bridge:** A lightweight script (`neora_agent.py`) using `pyautogui`, `requests`, and `pillow` to execute OS commands on local machines.
2. **Server/Agent Token Flow:** Shared-token polling and reporting between the broker and the desktop agent.
3. **Desktop Live Mirroring:** Base64 screenshot reporting from the agent when GUI mode is enabled.
4. **Headless Safety Mode:** A safer run mode that skips GUI automation for non-interactive runs.

---

## 📅 Future Milestones & Controlled Expansion

### Phase I: Local Storage & Local DB Sync (Q3 2026)
- **Shared Clipboard Memory:** Sync files and text buffers bidirectionally between Cloud Panel and Local Clipboard securely.
- **SQLite / Embedded Local Memory:** Maintain a secure local SQLite DB for permanent offline logs history, instead of relying on memory states.

### Phase II: Visual Navigation & Agent Auto-Locate (Q4 2026)
- **Computer Vision Locators:** Train/fine-tune minimal models to locate UI buttons matching coordinates, eliminating pure coordinate reliance.
- **Multimodal Visual Inputs:** Native image-based reasoning on the live desktop screenshots stream.

### Phase III: Enterprise Security & Multi-Agent Network (Q1 2027)
- **OAuth-Gate Control Authorization:** Access authorization keys only via secure MFA popups to avoid leak risks.
- **Multi-Device Cluster Control:** Control multiple PCs inside a local studio using a single master Neora instance.
