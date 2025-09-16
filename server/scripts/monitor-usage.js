// monitor-usage.js
require('dotenv').config();
const LLMService = require('./src/services/llmService');

async function monitorUsage() {
    console.log('Monitoring Usage Statistics...');
    
    const llmService = new LLMService();
    
    // Display current usage stats
    const usageStats = llmService.getUsageStats();
    console.log('\n--- Current Usage Statistics ---');
    console.log('Inngest Executions:', usageStats.inngest.executions);
    console.log('Inngest Errors:', usageStats.inngest.errors);
    console.log('OpenRouter Requests:', usageStats.openrouter.requests);
    console.log('OpenRouter Tokens:', usageStats.openrouter.tokens);
    console.log('OpenRouter Errors:', usageStats.openrouter.errors);
    console.log('Estimated Costs: $', usageStats.openrouter.costs.toFixed(6));
    console.log('Uptime:', Math.floor(usageStats.uptime / 60), 'minutes');
    
    // Display cache information
    console.log('\n--- Cache Information ---');
    console.log('Cache Size:', llmService.getCacheSize());
    
    // Test a simple LLM call to see usage tracking in action
    console.log('\n--- Testing Usage Tracking ---');
    try {
        const beforeStats = llmService.getUsageStats();
        console.log('Before test - Requests:', beforeStats.openrouter.requests);
        
        // Make a simple LLM call
        const result = await llmService.makeRequest({
            model: process.env.OPENROUTER_DEFAULT_MODEL || 'qwen/qwen3-coder:free',
            messages: [
                { role: "user", content: "Hello, this is a test for usage tracking." }
            ],
            max_tokens: 50
        });
        
        const afterStats = llmService.getUsageStats();
        console.log('After test - Requests:', afterStats.openrouter.requests);
        console.log('Tokens used:', afterStats.openrouter.tokens - beforeStats.openrouter.tokens);
        console.log('Estimated cost increase: $', (afterStats.openrouter.costs - beforeStats.openrouter.costs).toFixed(6));
        
        console.log('Test response:', result.choices[0].message.content.substring(0, 100) + '...');
    } catch (error) {
        console.error('Usage tracking test failed:', error.message);
    }
    
    console.log('\n--- Monitoring Complete ---');
}

monitorUsage().catch(console.error);