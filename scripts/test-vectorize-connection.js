// Test Vectorize.io Connection Script

const { Configuration, PipelinesApi } = require("@vectorize-io/vectorize-client");
require('dotenv').config({ path: '.env.local' });

async function testVectorizeConnection() {
    try {
        console.log('🔍 Testing Vectorize.io connection...');
        console.log('Organization ID:', process.env.VECTORIZE_IO_ORG_ID);
        console.log('Pipeline ID:', process.env.VECTORIZE_IO_PIPELINE_ID);
        console.log('Token available:', !!process.env.TOKEN);
        
        const api = new Configuration({
            accessToken: process.env.TOKEN,
            basePath: "https://api.vectorize.io/v1",
        });
        
        const pipelinesApi = new PipelinesApi(api);
        
        console.log('📡 Making API call...');
        const response = await pipelinesApi.retrieveDocuments({
            organizationId: process.env.VECTORIZE_IO_ORG_ID,
            pipelineId: process.env.VECTORIZE_IO_PIPELINE_ID,
            retrieveDocumentsRequest: {
                question: "How to call the API?",
                numResults: 5,
            }
        });
        
        console.log('✅ Connection successful!');
        console.log('📄 Documents found:', response.documents?.length || 0);
        
        if (response.documents && response.documents.length > 0) {
            console.log('📋 Sample document:');
            console.log('  ID:', response.documents[0].id);
            console.log('  Content preview:', response.documents[0].content?.substring(0, 100) + '...');
            console.log('  Score:', response.documents[0].score);
        }
        
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error('Error:', error?.message);
        if (error?.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

// Run the test
testVectorizeConnection()
    .then(() => {
        console.log('🎉 Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });
