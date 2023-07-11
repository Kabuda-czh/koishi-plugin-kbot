/*
 * @Author: Kabuda-czh
 * @Date: 2023-07-11 17:45:02
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 17:45:24
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\utils\downloadHandle.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import fs from 'node:fs'

export async function downloadAndMoveFiles(task, resource, urls, ctx, kbotDir, logger) {
  logger.info(`发现并未下载${resource}, 正在下载`)
  const downloadPromise = ctx.downloads.nereid(task, urls, resource, {
    retry: 3,
  })

  await downloadPromise.promise.then(async (path) => {
    const resourceDirNames = await fs.promises.readdir(path)
    for (const dirName of resourceDirNames) {
      const destinationPath = `${kbotDir}/${resource}/${dirName}`
      await fs.promises.mkdir(destinationPath, { recursive: true })
      const resourceFileNames = await fs.promises.readdir(`${path}/${dirName}`)
      for (const fileName of resourceFileNames)
        await fs.promises.rename(`${path}/${dirName}/${fileName}`, `${destinationPath}/${fileName}`)
    }
    logger.info(`${resource}下载完成`)
  })
}
