import childProcess from 'child_process';
import os from 'os';
import path from 'path';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';

const spawnPromise = (
  command: string,
  args: readonly string[] | undefined,
  options: childProcess.SpawnOptionsWithoutStdio | undefined | null,
) =>
  new Promise((resolve, reject) => {
    const childProc = childProcess.spawn(
      command,
      args,
      options || { env: process.env, cwd: process.cwd() },
    );
    const resultBuffers: any[] | Uint8Array[] = [];

    childProc.stdout.on('data', (buffer: Buffer) => {
      console.info({ buffer }, 'begin child process');
      resultBuffers.push(buffer);
    });
    // childProc.stderr.on('data', (buffer: Buffer) =>
    //   console.error({ buffer }, 'error running child process'),
    // );
    childProc.on('exit', (code: number, signal: NodeJS.Signals) => {
      console.info({ command }, 'completed child process');
      if (code || signal) {
        reject(`${command} failed with ${code || signal}`);
      } else {
        resolve(Buffer.concat(resultBuffers).toString().trim());
      }
    });
  });

const deleteFilePromise = (filePath: string) => new Promise((resolve, reject) => {
  if (!fs.existsSync(filePath)) {
    resolve(null);
    return;
  }

  fs.unlink(filePath, (err) => {
    if (err) reject(err);
    console.log(`${filePath} was deleted`);
    resolve(null);
  });
});

export const extractPreviewFromVideo = async (): Promise<void> => {
  try {
    const workDir = __dirname;// os.tmpdir();
    const inputFile = path.join(workDir, 'input.mp4');
    const outputFile = path.join(workDir, 'output.mp4');

    await deleteFilePromise(outputFile);

    // configs
    const startFrom = 10;
    const duration = 20;
    const resolution: 240 | 360 | 480 | 720 = 360;
    const preset: 'slow' | 'fast' | 'ultrafast' = 'slow';
    const crf = 28;

    // ffmpegCommand.save(outputFile);
    const result = await spawnPromise(
      ffmpeg.path,
      [
        '-ss',
        startFrom.toString(), // start extraction from
        '-t',
        duration.toString(), // duration
        '-i',
        inputFile, // input file
        '-vf',
        `scale=-1:${resolution.toString()}`, // keep it
        '-preset',
        preset, // process speed
        '-crf',
        crf.toString(), // bitrate
        '-an', // no audio
        outputFile,
      ],
      null,
    );
    // const result = await execPromise(
    //   `${ffmpeg.path} -ss 10 -t 20 -i ${inputFile} -vf scale=-1:360 -preset slow -crf 28 -an ${outputFile}`,
    // );
    console.log({result});
  } catch (error) {
    console.error({ error }, 'error extracting preview from video');
  }
};
