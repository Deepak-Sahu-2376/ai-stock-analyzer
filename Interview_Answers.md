# Interview Preparation: Stock Island Project

Here are tailored answers to common interview questions based on the architecture and implementation of your stock market application.

## 1. Architecture & Tech Stack
**Question:** "Why did you choose Node.js/Express over other frameworks for the backend? How did you structure your PostgreSQL database schema for scalability?"

**Answer:** 
*   **Node.js/Express:** I chose Node.js because its event-driven, non-blocking I/O model is perfect for a stock application that needs to handle numerous concurrent API calls (like fetching data from NSE, polling for corporate actions, and triggering AI summaries). Express provided a lightweight, unopinionated routing system that allowed me to build the RESTful API quickly without unnecessary overhead.
*   **Database Schema:** The PostgreSQL schema is highly normalized to maintain data integrity and support scalability. I structured it with a core `users` table linked via foreign keys (`user_id`) to `holdings`, `positions`, `alerts`, `wishlists`, and `push_subscriptions`. I used `ON DELETE CASCADE` to ensure clean data removal. To prevent redundant external API calls and save processing time, I created dedicated tables like `processed_announcements` and `processed_corporate_actions` to act as a persistent cache for data we've already fetched and analyzed.

## 2. Problem-Solving
**Question:** "What was the most challenging technical blocker you faced while building these projects, and how did you resolve it?"

**Answer:** 
The most challenging blocker was integrating the AI summarization for corporate announcements. The announcements from NSE are often provided as PDFs, and sometimes they are even zipped. Parsing complex PDFs and extracting text directly in Node.js was proving unreliable and blocking the event loop. 

**Resolution:** To resolve this, I decoupled the AI and document processing into a dedicated Python microservice (`AIService`) using FastAPI. Python has a much stronger ecosystem for this via `PyPDF2` and `langchain`. The Python service handles fetching the attachment, unzipping it if necessary, extracting the text, and communicating with the local Ollama LLM. The Node.js backend simply makes a lightweight HTTP call to this Python service, keeping the main backend responsive.

## 3. System Design & Optimization
**Question:** "If your project suddenly got 10,000 active users tomorrow, where would it break? How would you handle database performance or API rate limiting?"

**Answer:** 
*   **Breaking Points:** The system would likely break at the external API integration layer (`nseService.js`). If 10,000 users are simultaneously requesting live prices or corporate actions, the NSE API would rate-limit or block our IP. Additionally, the local Ollama LLM would choke if it received thousands of concurrent summarization requests.
*   **Handling the Load:**
    *   **API Rate Limiting & Caching:** Instead of every user request triggering a fetch to NSE, I would implement a central background worker that polls the NSE API at a safe interval and writes the data to a Redis cache. All 10,000 users would then read from the Redis cache in-memory, eliminating the load on the external API. I would also add `express-rate-limit` middleware to prevent abuse.
    *   **Database Performance:** I would ensure the PostgreSQL connection pool is optimized, add indexes to frequently queried columns like `user_id` and `symbol`, and use read-replicas if read operations become a bottleneck.

## 4. AI/RAG Integration
**Question:** "How did you handle the vector embeddings or context window limitations when integrating an LLM into your project?"

**Answer:** 
Since the project relies on analyzing corporate announcements using a local LLM (Ollama), handling the context window was critical. Some corporate PDFs are hundreds of pages long, which would instantly exceed the token limits of models like `gpt-oss:20b-cloud`. 

To handle this, I implemented a strict truncation strategy in the Python `AIService`. Before sending the extracted text to the LLM via Langchain, I truncate the text to the first 10,000 characters (`pdf_text[:10000]`). The most critical information in corporate filings (the summary of the action, dividends, splits, etc.) is almost always on the first page. I also used highly structured prompt engineering, forcing the LLM to return only a strict JSON response containing the "summary", "sentiment", and "impact", to save output tokens and ensure predictable parsing.

## 5. Lessons Learned
**Question:** "If you had to rewrite this entire project from scratch today, what architecture or design patterns would you change?"

**Answer:** 
*   **WebSockets over REST:** Currently, the application relies on REST APIs for fetching stock data. For a realtime application, I would rewrite the communication layer to use WebSockets (e.g., `Socket.io`), allowing the server to push price updates and alerts directly to the React frontend, reducing HTTP overhead.
*   **TypeScript:** I built the current version using plain JavaScript. If I started over, I would use TypeScript across the entire stack (React and Node.js) to enforce type safety, catch bugs at compile-time, and improve the developer experience, especially when dealing with complex API responses from NSE.
*   **Queue System for AI:** Instead of the Node backend waiting synchronously for the Python AI service to finish summarizing a PDF, I would implement a message queue (like RabbitMQ or BullMQ). The backend would queue the PDF URL, and the Python service would process it asynchronously and update the database when finished, improving overall system throughput.
