#!/usr/bin/env node

import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatBytes = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
};

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
};

const getPercentBar = (percent, width = 20) => {
  const filled = Math.round((percent / 100) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  const color = percent > 90 ? '\x1b[31m' : percent > 70 ? '\x1b[33m' : '\x1b[32m';
  return `${color}${bar}\x1b[0m ${percent.toFixed(1)}%`;
};

const clearScreen = () => {
  process.stdout.write('\x1b[2J\x1b[H');
};

const prompt = (question) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

// ============================================================================
// SYSTEM MONITORING
// ============================================================================

class SystemMonitor {
  constructor() {
    this.running = false;
    this.interval = null;
    this.history = {
      cpu: [],
      memory: [],
      timestamps: []
    };
  }

  getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
    
    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    return {
      idle: totalIdle / cpus.length,
      total: totalTick / cpus.length,
      usage: 100 - (100 * totalIdle / totalTick)
    };
  }

  getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return {
      total,
      free,
      used,
      percent: (used / total) * 100
    };
  }

  getDiskUsage() {
    try {
      const platform = os.platform();
      let output;
      
      if (platform === 'win32') {
        output = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf8' });
        const lines = output.split('\n').filter(l => l.trim());
        const disks = [];
        
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].trim().split(/\s+/);
          if (parts.length >= 3) {
            const [drive, free, total] = parts;
            if (total && free) {
              const totalBytes = parseInt(total);
              const freeBytes = parseInt(free);
              disks.push({
                mount: drive,
                total: totalBytes,
                free: freeBytes,
                used: totalBytes - freeBytes,
                percent: ((totalBytes - freeBytes) / totalBytes) * 100
              });
            }
          }
        }
        return disks;
      } else {
        output = execSync('df -k', { encoding: 'utf8' });
        const lines = output.split('\n').slice(1);
        const disks = [];
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 6) {
            const total = parseInt(parts[1]) * 1024;
            const used = parseInt(parts[2]) * 1024;
            const free = parseInt(parts[3]) * 1024;
            const mount = parts[5];
            
            if (total > 0 && mount.startsWith('/')) {
              disks.push({
                mount,
                total,
                used,
                free,
                percent: (used / total) * 100
              });
            }
          }
        });
        return disks;
      }
    } catch (err) {
      return [{
        mount: 'N/A',
        total: 0,
        used: 0,
        free: 0,
        percent: 0
      }];
    }
  }

  displaySnapshot() {
    clearScreen();
    console.log('\x1b[36m╔════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[36m║          SYSTEM GUARDIAN - Resource Monitor              ║\x1b[0m');
    console.log('\x1b[36m╚════════════════════════════════════════════════════════════╝\x1b[0m\n');
    
    // System Info
    console.log(`\x1b[1mSystem:\x1b[0m ${os.type()} ${os.release()}`);
    console.log(`\x1b[1mHostname:\x1b[0m ${os.hostname()}`);
    console.log(`\x1b[1mUptime:\x1b[0m ${formatUptime(os.uptime())}\n`);
    
    // CPU
    const cpu = this.getCPUUsage();
    console.log(`\x1b[1m🔧 CPU:\x1b[0m ${os.cpus()[0].model}`);
    console.log(`   Cores: ${os.cpus().length}`);
    console.log(`   Usage: ${getPercentBar(cpu.usage)}\n`);
    
    // Memory
    const mem = this.getMemoryUsage();
    console.log(`\x1b[1m💾 Memory:\x1b[0m`);
    console.log(`   Total: ${formatBytes(mem.total)}`);
    console.log(`   Used:  ${formatBytes(mem.used)}`);
    console.log(`   Free:  ${formatBytes(mem.free)}`);
    console.log(`   Usage: ${getPercentBar(mem.percent)}\n`);
    
    // Disk
    console.log(`\x1b[1m📁 Disk Usage:\x1b[0m`);
    const disks = this.getDiskUsage();
    disks.forEach(disk => {
      if (disk.total > 0) {
        console.log(`   ${disk.mount}`);
        console.log(`     ${formatBytes(disk.used)} / ${formatBytes(disk.total)}`);
        console.log(`     ${getPercentBar(disk.percent)}`);
      }
    });
    
    console.log('\n\x1b[90mPress Ctrl+C to exit\x1b[0m');
  }

  async startMonitoring(refreshRate = 2000) {
    this.running = true;
    console.log(`Starting system monitor (refresh every ${refreshRate}ms)...\n`);
    
    this.displaySnapshot();
    this.interval = setInterval(() => {
      if (this.running) {
        this.displaySnapshot();
      }
    }, refreshRate);

    process.on('SIGINT', () => {
      this.stopMonitoring();
      process.exit(0);
    });
  }

  stopMonitoring() {
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    console.log('\nMonitoring stopped.');
  }
}

// ============================================================================
// DISK ANALYZER
// ============================================================================

class DiskAnalyzer {
  constructor() {
    this.fileTypes = {};
    this.largeFiles = [];
    this.totalSize = 0;
    this.fileCount = 0;
  }

  analyzeDirectory(dirPath, options = {}) {
    const maxDepth = options.maxDepth || 5;
    const minSize = options.minSize || 10 * 1024 * 1024; // 10MB
    
    this._scan(dirPath, 0, maxDepth, minSize);
    return this._generateReport();
  }

  _scan(dirPath, depth, maxDepth, minSize) {
    if (depth > maxDepth) return;
    
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        
        try {
          const stats = fs.statSync(fullPath);
          
          if (stats.isFile()) {
            this.fileCount++;
            this.totalSize += stats.size;
            
            const ext = path.extname(item).toLowerCase() || 'no-extension';
            this.fileTypes[ext] = (this.fileTypes[ext] || 0) + stats.size;
            
            if (stats.size >= minSize) {
              this.largeFiles.push({
                path: fullPath,
                size: stats.size,
                modified: stats.mtime
              });
            }
          } else if (stats.isDirectory()) {
            this._scan(fullPath, depth + 1, maxDepth, minSize);
          }
        } catch (err) {
          // Skip files we can't access
        }
      });
    } catch (err) {
      console.error(`\x1b[31mError scanning ${dirPath}: ${err.message}\x1b[0m`);
    }
  }

  _generateReport() {
    const sortedTypes = Object.entries(this.fileTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    this.largeFiles.sort((a, b) => b.size - a.size);
    
    return {
      totalSize: this.totalSize,
      fileCount: this.fileCount,
      topFileTypes: sortedTypes,
      largeFiles: this.largeFiles.slice(0, 20)
    };
  }

  displayReport(report) {
    console.log('\n\x1b[36m╔════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[36m║              DISK ANALYSIS REPORT                         ║\x1b[0m');
    console.log('\x1b[36m╚════════════════════════════════════════════════════════════╝\x1b[0m\n');
    
    console.log(`\x1b[1mTotal Files:\x1b[0m ${report.fileCount.toLocaleString()}`);
    console.log(`\x1b[1mTotal Size:\x1b[0m ${formatBytes(report.totalSize)}\n`);
    
    console.log(`\x1b[1m📊 Top File Types by Size:\x1b[0m`);
    report.topFileTypes.forEach(([ext, size], i) => {
      const percent = (size / report.totalSize) * 100;
      console.log(`  ${i + 1}. ${ext.padEnd(15)} ${formatBytes(size).padEnd(12)} ${percent.toFixed(1)}%`);
    });
    
    console.log(`\n\x1b[1m📦 Largest Files:\x1b[0m`);
    report.largeFiles.slice(0, 10).forEach((file, i) => {
      console.log(`  ${i + 1}. ${formatBytes(file.size).padEnd(12)} ${file.path}`);
    });
  }
}

// ============================================================================
// TEMP FILE CLEANER
// ============================================================================

class TempCleaner {
  constructor() {
    this.tempDirs = [
      os.tmpdir(),
      path.join(os.homedir(), '.cache'),
      path.join(os.homedir(), 'AppData', 'Local', 'Temp')
    ].filter(dir => {
      try {
        return fs.existsSync(dir);
      } catch {
        return false;
      }
    });
  }

  async scan(daysOld = 7) {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const findings = [];
    
    console.log(`\nScanning for files older than ${daysOld} days...\n`);
    
    for (const dir of this.tempDirs) {
      console.log(`Checking: ${dir}`);
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          try {
            const stats = fs.statSync(fullPath);
            if (stats.mtime.getTime() < cutoffTime) {
              findings.push({
                path: fullPath,
                size: stats.size,
                modified: stats.mtime,
                isDirectory: stats.isDirectory()
              });
            }
          } catch (err) {
            // Skip inaccessible files
          }
        }
      } catch (err) {
        console.log(`  \x1b[33m⚠ Cannot access: ${err.message}\x1b[0m`);
      }
    }
    
    return findings;
  }

  async clean(findings, dryRun = true) {
    if (findings.length === 0) {
      console.log('\n✓ No old temporary files found.');
      return { deleted: 0, freed: 0, errors: 0 };
    }
    
    const totalSize = findings.reduce((sum, f) => sum + f.size, 0);
    
    console.log(`\n\x1b[1mFound ${findings.length} items (${formatBytes(totalSize)})\x1b[0m`);
    
    if (dryRun) {
      console.log('\n\x1b[33m[DRY RUN] No files will be deleted\x1b[0m\n');
      findings.slice(0, 10).forEach(f => {
        console.log(`  ${formatBytes(f.size).padEnd(12)} ${f.path}`);
      });
      if (findings.length > 10) {
        console.log(`  ... and ${findings.length - 10} more`);
      }
      return { deleted: 0, freed: 0, errors: 0 };
    }
    
    const confirm = await prompt(`\n\x1b[31mDelete ${findings.length} items? (yes/no): \x1b[0m`);
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Cancelled.');
      return { deleted: 0, freed: 0, errors: 0 };
    }
    
    let deleted = 0, freed = 0, errors = 0;
    
    console.log('\nDeleting...');
    for (const item of findings) {
      try {
        if (item.isDirectory) {
          fs.rmSync(item.path, { recursive: true, force: true });
        } else {
          fs.unlinkSync(item.path);
        }
        deleted++;
        freed += item.size;
        process.stdout.write(`\r  Deleted: ${deleted}/${findings.length}`);
      } catch (err) {
        errors++;
      }
    }
    
    console.log(`\n\n✓ Cleaned up ${formatBytes(freed)}`);
    if (errors > 0) {
      console.log(`\x1b[33m⚠ ${errors} items could not be deleted\x1b[0m`);
    }
    
    return { deleted, freed, errors };
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

const showHelp = () => {
  console.log(`
\x1b[36m╔════════════════════════════════════════════════════════════╗
║            SYSTEM GUARDIAN v1.0.0                         ║
║         Professional System Utilities Package             ║
╚════════════════════════════════════════════════════════════╝\x1b[0m

\x1b[1mUSAGE:\x1b[0m
  node system-guardian.js [command] [options]

\x1b[1mCOMMANDS:\x1b[0m
  monitor           Live system resource monitoring
  analyze <path>    Analyze disk usage in directory
  clean [days]      Find and clean old temp files (default: 7 days)
  help              Show this help message

\x1b[1mEXAMPLES:\x1b[0m
  node system-guardian.js monitor
  node system-guardian.js analyze ~/Documents
  node system-guardian.js clean 14
  node system-guardian.js clean --dry-run

\x1b[1mOPTIONS:\x1b[0m
  --dry-run         Preview changes without deleting
  --depth <n>       Max directory depth for analysis (default: 5)
  --min-size <mb>   Minimum file size for large file report (default: 10)
`);
};

const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  switch (command) {
    case 'monitor': {
      const monitor = new SystemMonitor();
      await monitor.startMonitoring(2000);
      break;
    }
    
    case 'analyze': {
      const targetPath = args[1] || process.cwd();
      
      if (!fs.existsSync(targetPath)) {
        console.error(`\x1b[31mError: Path does not exist: ${targetPath}\x1b[0m`);
        process.exit(1);
      }
      
      console.log(`\nAnalyzing: ${targetPath}\n`);
      console.log('This may take a while for large directories...');
      
      const analyzer = new DiskAnalyzer();
      const report = analyzer.analyzeDirectory(targetPath, {
        maxDepth: parseInt(args.find(a => a.startsWith('--depth='))?.split('=')[1]) || 5,
        minSize: (parseInt(args.find(a => a.startsWith('--min-size='))?.split('=')[1]) || 10) * 1024 * 1024
      });
      
      analyzer.displayReport(report);
      break;
    }
    
    case 'clean': {
      const daysOld = parseInt(args[1]) || 7;
      const dryRun = args.includes('--dry-run');
      
      const cleaner = new TempCleaner();
      const findings = await cleaner.scan(daysOld);
      await cleaner.clean(findings, dryRun);
      break;
    }
    
    default:
      console.error(`\x1b[31mUnknown command: ${command}\x1b[0m`);
      console.log('Run "node system-guardian.js help" for usage information.');
      process.exit(1);
  }
};

main().catch(err => {
  console.error(`\x1b[31mFatal error: ${err.message}\x1b[0m`);
  process.exit(1);
});
