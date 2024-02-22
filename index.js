
// Impor modul yang dibutuhkan
import axios from 'axios';
import inquirer from 'inquirer';
import crypto from 'node:crypto';  
import path from 'node:path';
import fs from 'node:fs';
import { setTimeout } from 'node:timers/promises';
import { 
  loggerFailed, 
  loggerSuccess, 
  loggerInfo
} from './logger.js';
import chalk from 'chalk';

// Fungsi untuk generate string random
const generateRandomString = (length) => {
  const randomBytes = crypto.randomBytes(Math.ceil(length/2));
  return randomBytes.toString('hex').slice(0, length); 
};

// Generate device code
let deviceCode = generateRandomString(16); 

// Fungsi untuk delay eksekusi asyncc
const delay = async (milliseconds) => {
  loggerInfo(`Waiting delay ${milliseconds} ms`);
  await setTimeout(milliseconds);
};

// Fungsi untuk mendapatkan OTP
const getOtp = async (phoneNumber) => {
  try {
    // Setting header axios
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 11; vitro Y72 Build/RP1A.200720.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 [FB_IAB/Orca-Android;FBAV/300.0.0.16.124;]',
      'Connection': 'Keep-Alive',
      'Accept-Encoding': 'gzip',  
      'token': '',
      // other headers
    };
    
    // Endpoint OTP
    const url = `https://api-service.tomoro-coffee.id/portal/app/member/sendMessage?phone=${phoneNumber}&areaCode=62&verifyChannel=SMS`;
    
    // Kirim request OTP
    const response = await axios.get(url, {headers}); 

    // Cek response  
    if(response.data.success === false) {
      console.log(response.data);
      loggerFailed(response.data.message);
      throw Error(response.data.message);
    }

    loggerSuccess('Success get OTP');
    
  } catch (error) {
    throw error; 
  }
};

// Fungsi untuk memverifikasi OTP
const verifyOtp = async (phone, otp) => {

  try {
    
    // Body request
    let body = JSON.stringify({ 
      phoneArea: '62',
      phone: phone,
      verifyCode: otp,
      // other params
    });

    // Headers
    const headers = {
      'User-Agent': 'My App v1.0', 
      'Content-Type': 'application/json',
      // other headers
    };

    // Endpoint verify OTP
    const url = 'https://api-service.tomoro-coffee.id/portal/app/member/loginOrRegister';

    // Kirim request verifikasi OTP
    const response = await axios.post(url, body, {headers});

    // Cek response
    if(response.data.success === true) {
      // Ambil data akun 
      const {accountCode, token} = response.data.data;  
      loggerSuccess('Success verify OTP');
      loggerInfo(`Account code: ${accountCode}`);
      console.log(response.data.data);
      // Simpan akun ke file
      const accountStr = `${accountCode}||${token}\n`;
      const fileName = path.join(process.cwd(), 'acc.txt');

      // Cek file dan buat jika belum ada
      if (!fs.existsSync(fileName)) {
        loggerFailed(`${fileName} not found`);
        loggerInfo(`Creating file ${fileName}`);
        fs.appendFile(fileName, 'w', (err, data) => {
          if (err) loggerFailed(`Failed to create file at ${fileName}`);
          loggerSuccess(`Success create file ${fileName}`);
        });
      }

      // Tambahkan akun ke file 
      fs.appendFileSync('acc.txt', accountStr);
      
      // Kembalikan data akun
      return {
        accountCode,
        token  
      };

    } else {
      // Gagal verifikasi OTP
      console.log(response.data);
      loggerFailed(response.data.message);
      throw Error(response.data.message);
    }

  } catch (error) {
    throw error;
  }

};

// Fungsi untuk klik link refferal
const giveClick = async (token, refCode) => {
  
  try {

    // Body request
    // Body request
    let body = JSON.stringify({
    assistanceCode: refCode,
    longitude: "",
    latitude: ""
    });
    

    // Headers
    const headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 9; Redmi 7 Build/PKQ1.180904.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/85.0.4183.101 Mobile Safari/537.36",
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Pragma": "no-cache",
    "Cache-Control": "no-cache",
    "sec-ch-ua": "\"Google Chrome\";v=\"87\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"87\"",
    "sec-ch-ua-mobile": "?0",
    "appChannel": "google play",
    "revision": "2.6.3",
    "countryCode": "id",
    "appLanguage": "en",
    "timeZone": "Asia/Jakarta",
    "token": token,
    "Origin": "https://h5-app.tomoro-coffee.id",
    "X-Requested-With": "com.tomoro.indonesia.android",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    "Referer": "https://h5-app.tomoro-coffee.id/",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "en-US,en;q=0.9"
    };
    

    // Endpoint give click  
    const url = 'https://api-service.tomoro-coffee.id/portal/app/assistance/assist';

    // Kirim request 
    const response = await axios.post(url, body, {headers});

    // Cek response
    if (response.data.success === true) {
      loggerSuccess('Success give click');
      loggerInfo(`Nickname: ${response.data.data.nickname}`); 
      loggerInfo(`Current price: ${response.data.data.assistancePriceProgress}`);
      console.log();
      return;

    } else {
      // Gagal klik link
      loggerFailed(response.data.message);
      throw Error(response.data.message);
    }

  } catch (error) {
    throw error;
  }

};

(async () => {

  try {
    
    // Tampilkan header
    process.stdout.write('\x1bc');
    console.log(chalk.bold.green('Tomoro refferal'));
    console.log();


      while(true) {

        loggerInfo(`Using device code: ${deviceCode}`); 
        console.log('!', chalk.bold.cyan('Check your number for OTP'), chalk.italic.yellow('input your phone number'));

        // Ambil nomor telepon
        const {phoneNum} = await inquirer.prompt({
          type: 'input',
          message: 'Insert your phone number for reff account?',
          name: 'phoneNum'
        });

        // Dapatkan OTP
        await getOtp(phoneNum);

        // Input OTP  
        const {otp} = await inquirer.prompt({
          type: 'input',
          message: 'Check your number for OTP',
          name: 'otp'  
        });

        // Verifikasi OTP
        const account = await verifyOtp(phoneNum, otp); 
        const {token} = account;

        // Ambil kode referral 
        const reffFile = path.join(process.cwd(), 'reff.txt');
        if (!fs.existsSync(reffFile)) {
          loggerFailed('Reff.txt not found');
          throw new Error('Reff.txt file not found');
        }
        const reffCode = fs.readFileSync(reffFile, 'utf-8');
        loggerSuccess(`Found reff code ${reffCode}`);
        // Klik link referral
        await giveClick(token, reffCode);
        
        // Tawarkan buat akun lagi
        const {wantMore} = await inquirer.prompt({
          type: 'confirm',  
          message: 'Do you want create account again ?',
          name: 'wantMore'
        });

        // Berhenti jika tidak mau buat lagi
        if (!wantMore) {
          console.log();
          break; 
        }

        // Ganti device code
        deviceCode = generateRandomString(16);
        
        // Delay beberapa detik
        await delay(5000);
        
        console.log();

      }

    console.log('Thanks for using my code');
    
  } catch (error) {
    console.log(error.message); 
  }

})();