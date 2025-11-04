# System Guardian 🛡️

> **A system utilities project built for Code Olympics hackathon with professional builder limit while following the no-import rookie constraint**

[![Lines](https://img.shields.io/badge/Lines-500%2F500-success)](.) [![No Imports](https://img.shields.io/badge/No%20Imports-Allowed-success)](.) [![Single File](https://img.shields.io/badge/Single%20File-CLI-orange)](.)

A zero-dependency system monitoring CLI tool built for the Code Olympics hackathon. Monitor system resources, analyze disk usage, clean temporary files, and benchmark performance—all in under 500 lines of code using only built-in Node.js functions.

## Demo

[![asciicast](https://asciinema.org/a/753458.svg)](https://asciinema.org/a/753458)

## 🎯 Challenge

**Code Olympics Challenge:** "Create a system utilities project with the professional builder limit while following the no-import rookie constraint."

- **No-Import Rookie:** Only built-in functions, no external libraries
- **Professional Builders:** Maximum 500 lines of code
- **System Utilities:** Monitors, cleaners, automation tools

![Code Olympics Challenge](code-olympics-challenge.png)

## Features

- **Real-time Monitoring**: Live CPU, memory, disk, and network monitoring with interactive controls
- **Disk Analysis**: Deep directory scanning with file type statistics and large file detection
- **Temp File Cleanup**: Automated cleanup of old temporary files across platforms
- **System Information**: Comprehensive hardware and OS details
- **Performance Benchmarking**: CPU and memory stress tests with scoring
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Zero Dependencies**: Pure Node.js with built-in modules only
- **Export Capabilities**: Save monitoring data to JSON files
- **Interactive UI**: Keyboard shortcuts for dynamic monitoring views

## Installation

### Prerequisites

- Node.js >= 18.0.0

### Install Globally

```bash
npm install -g @ansospace/sysmon
```

### Or Run Locally

```bash
git clone <repository-url>
cd sysmon
npm install
npm link
```

## Usage

```bash
sysmon [command] [options]
```

## Commands

### `sysmon monitor`

Start real-time system monitoring with live updates every 2 seconds.

**Options:**

- `--export <path>`: Export snapshots to JSON file (e.g., `--export reports/snapshot.json`)

**Interactive Controls:**

- `n`: Toggle network interface display
- `p`: Toggle top processes display
- `Ctrl+C`: Exit monitoring

### `sysmon analyze <path>`

Analyze disk usage in the specified directory.

**Options:**

- `--depth <n>`: Maximum directory depth (default: 5)
- `--min-size <mb>`: Minimum file size for large file report (default: 10MB)

### `sysmon clean [days]`

Find and clean temporary files older than specified days.

**Options:**

- `--dry-run`: Preview changes without deleting files

### `sysmon info`

Display detailed system information including OS, hardware, and network details.

### `sysmon benchmark`

Run system performance benchmarks for CPU and memory.

### `sysmon help`

Display help information and command usage.

## Examples

See [examples.md](examples.md) for detailed usage examples.

## Development

### Line Count Constraint

This project maintains a strict 500-line limit for the main CLI file (`bin/cli.js`). Run the line counter:

```bash
npm run prepublishOnly
```

### Line Count Verification

```bash
node scripts/count-lines.js
```

Output:

```bash
📊 Line Count: 500 / 500
✅ Perfect! Exactly 500 lines.
```

### Project Structure

```
sysmon/
├── bin/cli.js          # Main CLI application
├── scripts/
│   └── count-lines.js  # Line counting utility
├── package.json        # Project metadata
├── README.md           # This file
└── examples.md         # Usage examples
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Ensure changes stay under 500 executable lines
4. Test on multiple platforms (Windows, Linux, macOS)
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Sanjay Kumar Sah

---

**Built for Hackathons | Zero Dependencies | Cross-Platform | Professional Grade**
