import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
require('dotenv').config()
const axios = require("axios");

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async signup(dto: CreateUserDto): Promise<User> {
    const { name, mobile, password } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ name, mobile, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async login(mobile: string, password: string): Promise<{ token: string } | null> {
    const user = await this.userRepository.findOne({ where: { mobile } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { id: user.id, mobile: user.mobile, status: user.status };
      const token = this.jwtService.sign(payload);
      return { token };
    }
    return null;
  }

  async validateUser(payload: { id: number; mobile: string }): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: payload.id, mobile: payload.mobile } });
  }

  async call() {
    let counter = 0;
    let totalRequests = 150; // Number of requests
  
    console.log("🚀 Starting bulk requests...");
  
    // Define Headers
    const headers = {
      "Reqfrom": "web",
      "Username": "web",
      "Servicefor": "saf_ke",
      "flow": "direct",
      "Content-Type": "application/json",
      "Cookie": "PHPSESSID=s9h1qo11odqjvfigqd79urqch5"
    };
  
    // Define Request Body
    const data = {
      "mcc": "652",
      "mnc": "04",
      "uid": ""
    };
  
    // Define Request Function
    const sendRequest = async (i) => {
      try {
        console.log(`🚀 Request ${i + 1} started`);
        const response = await axios.post("https://telecubesapis.bngrenew.com/apn/config", data, { headers });
        console.log(`✅ Request ${i + 1} success:`, response.data.status);
        counter++;
      } catch (error) {
        console.error(`❌ Request ${i + 1} failed:`, error.message);
      } finally {
        console.log(`⏳ Completed Requests: ${counter} / ${totalRequests}`);
      }
    };
  
    // Fire all requests in parallel using Promise.all()
    await Promise.all(Array.from({ length: totalRequests }, (_, i) => sendRequest(i)));
  
    console.log("🎉 All requests completed!");
  }


  async loadTest(apiUrl="https://telecubesapis.bngrenew.com/apn/config", duration = 60000, concurrency = 50, intervalTime = 10) {
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    let activeRequests = 0;
  
    console.log("🚀 Starting real-time load test...");
  
    const headers = {
      "Reqfrom": "web",
      "Username": "web",
      "Servicefor": "saf_ke",
      "flow": "direct",
      "Content-Type": "application/json",
      "Cookie": "PHPSESSID=s9h1qo11odqjvfigqd79urqch5"
    };
  
    const data = {
      "mcc": "652",
      "mnc": "04",
      "uid": ""
    };
  
    async function sendRequest(requestNumber) {
      try {
        console.log(`🚀 Request ${requestNumber} started`);
        const response = await axios.post(apiUrl, data, { headers });
        console.log(`✅ Request ${requestNumber} success:`, response.data.status);
        successfulRequests++;
      } catch (error) {
        console.error(`❌ Request ${requestNumber} failed:`, error.message);
        failedRequests++;
      } finally {
        totalRequests++;
        activeRequests--;
      }
    }
  
    const interval = setInterval(() => {
      if (activeRequests < concurrency) {
        activeRequests++;
        sendRequest(totalRequests + 1);
      }
    }, intervalTime);
  
    setTimeout(() => {
      clearInterval(interval);
      console.log("\n🎉 Load Test Completed!");
      console.log(`🔹 Total Requests Sent: ${totalRequests}`);
      console.log(`✅ Successful Requests: ${successfulRequests}`);
      console.log(`❌ Failed Requests: ${failedRequests}`);
      console.log(`📊 Success Rate: ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);
    }, duration);
  }



  async advancedLoadTest({
    endpoints,
    duration = 60000,
    concurrency = 50,
    intervalTime = 10,
    httpMethods = ["POST"],
    generatePayload = () => ({ "mcc": "652", "mnc": "04", "uid": Math.random().toString(36).substring(7) }) // Random UID
  }) {
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    let activeRequests = 0;
    let responseTimes = [];
  
    console.log("🚀 Starting Advanced Load Test...");
  
    const headers = {
      "Reqfrom": "web",
      "Username": "web",
      "Servicefor": "saf_ke",
      "flow": "direct",
      "Content-Type": "application/json",
      "Cookie": "PHPSESSID=s9h1qo11odqjvfigqd79urqch5"
    };
  
    async function sendRequest(requestNumber) {
      if (activeRequests >= concurrency) return;
      activeRequests++;
  
      const method =  1 ?"POST" :httpMethods[Math.floor(Math.random() * httpMethods.length)]; // Random HTTP method
      const endpoint = endpoints[0] || endpoints[Math.floor(Math.random() * endpoints.length)]; // Random endpoint
      const data = generatePayload(); // Dynamic payload
      const options = { headers };
  
      try {
        console.log(`🚀 [${method}] Request ${requestNumber} -> ${endpoint}`);
        const startTime = Date.now();
  
        let response;
        if (method === "GET") {
          response = await axios.get(endpoint, options);
        } else if (method === "DELETE") {
          response = await axios.delete(endpoint, options);
        } else {
          response = await axios({ method, url: endpoint, data, ...options });
        }
  
        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
        successfulRequests++;
        console.log(`✅ Request ${requestNumber} success in ${endTime - startTime}ms`);
      } catch (error) {
        failedRequests++;
        console.error(`❌ Request ${requestNumber} failed: ${error.message}`);
      } finally {
        totalRequests++;
        activeRequests--;
      }
    }
  
    const interval = setInterval(() => {
      if (activeRequests < concurrency) {
        sendRequest(totalRequests + 1);
      }
    }, Math.random() * intervalTime + 5); // Randomized interval
  
    setTimeout(() => {
      clearInterval(interval);
      const avgResponseTime = responseTimes.length
        ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2)
        : "N/A";
  
      console.log("\n🎉 Load Test Completed!");
      console.log(`🔹 Total Requests Sent: ${totalRequests}`);
      console.log(`✅ Successful Requests: ${successfulRequests}`);
      console.log(`❌ Failed Requests: ${failedRequests}`);
      console.log(`📊 Success Rate: ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);
      console.log(`⏱️ Avg Response Time: ${avgResponseTime} ms`);
    }, duration);
  }

  async advancedLoadTest1({
    baseURL,
    duration = 60000, // Test duration in ms (1 min)
    concurrency = 100, // Max concurrent requests
    intervalTime = 20, // Request interval (5-20ms random delay)
  }) {
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    let activeRequests = 0;
    let responseTimes = [];
  
    console.log(`🚀 Starting Load Test on ${baseURL} ...`);
  
    async function sendRequest(requestNumber) {
      if (activeRequests >= concurrency) return;
      activeRequests++;
  
      const randomRCID = Math.random().toString(36).substring(7); // Generate unique rcid
      const url = `${baseURL.replace("{rcid}", randomRCID)}`;
  
      try {
        console.log(`🚀 Request ${requestNumber} -> ${url}`);
        const startTime = Date.now();
  
        const response = await axios.get(url);
        const endTime = Date.now();
  
        responseTimes.push(endTime - startTime);
        successfulRequests++;
        console.log(`✅ Request ${requestNumber} success in ${endTime - startTime}ms`);
      } catch (error) {
        failedRequests++;
        console.error(`❌ Request ${requestNumber} failed: ${error.message}`);
      } finally {
        totalRequests++;
        activeRequests--;
      }
    }
  
    const interval = setInterval(() => {
      if (activeRequests < concurrency) {
        sendRequest(totalRequests + 1);
      }
    }, Math.random() * intervalTime + 5); // Randomized interval
  
    setTimeout(() => {
      clearInterval(interval);
      const avgResponseTime = responseTimes.length
        ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2)
        : "N/A";
  
      console.log("\n🎉 Load Test Completed!");
      console.log(`🔹 Total Requests Sent: ${totalRequests}`);
      console.log(`✅ Successful Requests: ${successfulRequests}`);
      console.log(`❌ Failed Requests: ${failedRequests}`);
      console.log(`📊 Success Rate: ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);
      console.log(`⏱️ Avg Response Time: ${avgResponseTime} ms`);
    }, duration);
  }
  
  

}
