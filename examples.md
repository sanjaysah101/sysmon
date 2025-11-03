# System Guardian - Usage Examples

This document provides detailed examples for all System Guardian commands.

## Real-Time Monitoring

### Basic Monitoring

```bash
# Start live system monitoring
sysmon monitor
```

**Output:**

```
╔════════════════════════════════════════════════════════════╗
║              SYSTEM GUARDIAN - Resource Monitor              ║
╚════════════════════════════════════════════════════════════╝

System: Windows_NT 10.0.19045
Hostname: DESKTOP-EXAMPLE
Uptime: 2d 14h 32m

🔧 CPU: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
   Cores: 12
   Usage: █████████████████░░░ 85.2%

💾 Memory:
   Total: 15.87 GB
   Used:  12.34 GB
   Free:  3.53 GB
   Usage: █████████████████░░░ 77.8%

📁 Disk Usage:
   C:: 245.67 GB / 499.00 GB █████████████████░░░ 49.2%

Press Ctrl+C to exit, n for network, p for processes
```

### Monitoring with Export

```bash
# Monitor and export data to JSON file
sysmon monitor --export reports/snapshot.json
```

### Interactive Features

During monitoring, use these keyboard shortcuts:

- `n`: Toggle network interface information
- `p`: Toggle top processes display
- `Ctrl+C`: Exit monitoring

**With network info enabled:**

```
🌐 Network Interfaces:
   Ethernet: 192.168.1.100 (IPv4)
   Wi-Fi: 192.168.1.101 (IPv4)
   Ethernet: fe80::1234:5678:9abc:def0 (IPv6)
```

**With processes enabled:**

```
⚙️  Top Processes:
   1. chrome.exe (PID: 1234) - CPU: 15.2%, MEM: 8.5%
   2. code.exe (PID: 5678) - CPU: 12.1%, MEM: 6.2%
   3. node.exe (PID: 9012) - CPU: 8.7%, MEM: 4.1%
```

## Disk Analysis

### Basic Directory Analysis

```bash
# Analyze current directory
sysmon analyze .
```

**Output:**

```
╔════════════════════════════════════════════════════════════╗
║                   DISK ANALYSIS REPORT                    ║
╚════════════════════════════════════════════════════════════╝

Total Files: 1,247
Total Size: 2.34 GB

📊 Top File Types by Size:
  1. .jpg            456.78 MB     19.5%
  2. .mp4            345.67 MB     14.8%
  3. .pdf            234.56 MB     10.0%
  4. .exe            123.45 MB      5.3%
  5. .dll            98.76 MB       4.2%

📦 Largest Files:
  1. 256.78 MB     ./videos/movie.mp4
  2. 189.34 MB     ./photos/holiday.jpg
  3. 145.67 MB     ./documents/manual.pdf
```

### Deep Analysis with Custom Options

```bash
# Analyze with deeper scanning and smaller file threshold
sysmon analyze ~/Documents --depth 8 --min-size 5
```

### Analyze Specific Directory

```bash
# Analyze Downloads folder
sysmon analyze ~/Downloads
```

## Temporary File Cleanup

### Preview Cleanup (Dry Run)

```bash
# Preview files older than 7 days
sysmon clean
```

**Output:**

```
Scanning for files older than 7 days...

Checking: C:\Users\Sanjay\AppData\Local\Temp
Checking: C:\Users\Sanjay\.cache

Found 23 items (156.78 MB)

[DRY RUN] No files will be deleted

  45.67 MB     C:\Users\Sanjay\AppData\Local\Temp\installer.exe
  34.56 MB     C:\Users\Sanjay\.cache\old_cache.dat
  23.45 MB     C:\Users\Sanjay\AppData\Local\Temp\temp_file.tmp
  ... and 20 more
```

### Actual Cleanup

```bash
# Clean files older than 14 days
sysmon clean 14
```

**Output:**

```
Scanning for files older than 14 days...

Found 15 items (89.34 MB)

Delete 15 items? (yes/no): yes

Deleting...
  Deleted: 15/15

✓ Cleaned up 89.34 MB
```

### Safe Preview Mode

```bash
# Always use dry-run first to see what will be deleted
sysmon clean 30 --dry-run
```

## System Information

### Display System Details

```bash
sysmon info
```

**Output:**

```
╔════════════════════════════════════════════════════════════╗
║                   SYSTEM INFORMATION                      ║
╚════════════════════════════════════════════════════════════╝

OS: Windows_NT 10.0.19045 (x64)
Hostname: DESKTOP-EXAMPLE
Platform: win32
Uptime: 2d 14h 32m
Total Memory: 15.87 GB
CPU Cores: 12
CPU Model: Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
Home: C:\Users\Sanjay
Temp: C:\Users\Sanjay\AppData\Local\Temp
```

## Performance Benchmarking

### Run System Benchmarks

```bash
sysmon benchmark
```

**Output:**

```
╔════════════════════════════════════════════════════════════╗
║                   SYSTEM BENCHMARK                        ║
╚════════════════════════════════════════════════════════════╝

Running CPU benchmark...
CPU benchmark Score: 85

Running memory benchmark...
memory benchmark Score: 92

Total System Score: 88
```

## Advanced Usage Examples

### Monitoring Pipeline

```bash
# Monitor and export, then analyze the export
sysmon monitor --export reports/$(date +%Y%m%d_%H%M%S).json &
sleep 30
kill %1
sysmon analyze reports/
```

### Batch Operations

```bash
# Clean temp files, then run benchmark
sysmon clean 7 && sysmon benchmark
```

### Cross-Platform Usage

```bash
# Works identically on Windows, macOS, and Linux
sysmon monitor    # Windows: uses wmic, tasklist
sysmon monitor    # macOS/Linux: uses df, ps
```

## Error Handling Examples

### Invalid Path

```bash
sysmon analyze /nonexistent/path
# Error: Path does not exist: /nonexistent/path
```

### Permission Denied

```bash
sysmon analyze /root
# Error accessing file /root: EACCES: permission denied
```

## Automation Examples

### Cron Job for Daily Monitoring

```bash
# Add to crontab for daily system snapshots
0 9 * * * /usr/local/bin/sysmon monitor --export /var/log/sysmon/daily_$(date +\%Y\%m\%d).json &
```

### Log Rotation with Cleanup

```bash
# Clean old logs and temp files weekly
@weekly /usr/local/bin/sysmon clean 30
```

## Troubleshooting

### High CPU Usage During Monitoring

The monitoring process itself uses minimal resources (< 1% CPU), but frequent updates can be adjusted by modifying the refresh rate in the source code.

### Permission Issues on macOS/Linux

Some directories require sudo access. Use `sudo sysmon analyze /System` for system directories.

### Windows UAC Prompts

On Windows, some operations may trigger UAC prompts. Run as Administrator for full access.

---

For more information, run `sysmon help` or visit the main repository.
