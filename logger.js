import chalk from 'chalk';
export const loggerSuccess = (msg) => {
  try {
    const formattedMsg = chalk.green(msg);
    console.log(`🗸 ${formattedMsg}`);
  } catch (error) {
    console.log(error + 'failed logger success');
  }
};
export const loggerFailed = (msg) => {
  try {
    const formattedMsg = chalk.red(msg);
    console.log(`x ${formattedMsg}`);
  } catch (error) {
    console.log(error + 'failed logger');
  }
};
export const loggerInfo = (msg) => {
  try {
    const formattedMsg = chalk.magenta(msg);
    console.log(`! ${formattedMsg}`);
  } catch (error) {
    console.log(error + 'failed logger');
  }
};
export const loggerItalic = (msg) => {
  try {
    const formattedMsg = chalk.italic(msg);
    console.log(`! ${formattedMsg}`);
  } catch (error) {
    console.log(error + 'failed logger');
  }
};
