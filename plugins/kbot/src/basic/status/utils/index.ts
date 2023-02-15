import os from "os";
import * as si from "systeminformation";

export async function getSystemInfo(koishiVersion: string, pluginSize: number) {
  const promisList = await Promise.all([
    getCPUUsage(),
    si.osInfo(),
    si.cpuCurrentSpeed(),
    si.mem(),
    getDiskUsage(),
  ]);

  const [
    { cpuUsage, cpuInfo },
    { distro },
    { avg },
    { total, used, swaptotal, swapused },
    { disksize, diskused },
  ] = promisList;

  // memory
  const memoryTotal = (total / 1024 / 1024 / 1024).toFixed(2) + " GB";
  const memoryUsed = (used / 1024 / 1024 / 1024).toFixed(2);
  const memoryUsage = ((used / total)).toFixed(2);
  // swap
  const swapTotal = (swaptotal / 1024 / 1024 / 1024).toFixed(2) + " GB";
  const swapUsed = (swapused / 1024 / 1024 / 1024).toFixed(2);
  const swapUsage = ((swapused / swaptotal)).toFixed(2);
  // disk
  const diskTotal = (disksize / 1024 / 1024 / 1024).toFixed(2) + " GB";
  const diskUsed = (diskused / 1024 / 1024 / 1024).toFixed(2);
  const diskUsage = ((diskused / disksize)).toFixed(2);

  const systemInfo = {
    dashboard: [
      {
        progress: +cpuUsage,
        title: `${cpuUsage}% - ${avg}Ghz`,
      },
      {
        progress: +memoryUsage,
        title: `${memoryUsed} / ${memoryTotal}`,
      },
      {
        progress: +swapUsage,
        title: `${swapUsed} / ${swapTotal}`,
      },
      {
        progress: +diskUsage,
        title: `${diskUsed} / ${diskTotal}`,
      }
    ],
    information: [
      {
        key: "CPU",
        value: cpuInfo,
      },
      {
        key: "System",
        value: distro,
      },
      {
        key: "Version",
        value: koishiVersion,
      },
      {
        key: "Plugins",
        value: `${pluginSize} loaded`,
      },
    ],
  }

  return systemInfo
}

async function getDiskUsage() {
  const disks = await si.fsSize();
  let disksize = 0,
    diskused = 0;
  disks.forEach((disk) => {
    disksize += disk.size;
    diskused += disk.used;
  });

  return {
    disksize,
    diskused,
  };
}

async function getCPUUsage() {
  const t1 = getCPUInfo();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const t2 = getCPUInfo();

  const idle = t2.idle - t1.idle;
  const total = t2.total - t1.total;

  const cpuUsage = ((1 - idle / total)).toFixed(2);
  const cpuInfo = os.cpus()[0].model;

  return {
    cpuUsage,
    cpuInfo,
  };
}

function getCPUInfo() {
  const cpus = os.cpus();
  let idle = 0;

  const total = cpus.reduce((acc, cpu) => {
    for (const type in cpu.times) {
      acc += cpu.times[type];
    }
    idle += cpu.times.idle;
    return acc;
  }, 0);

  return {
    idle,
    total,
  };
}
