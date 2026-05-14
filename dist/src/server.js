import app from './app.js';
import config from './config/env.js';
async function main() {
    try {
        app.listen(config.PORT, () => {
            console.log(`📡 FinNexus is listening on port ${config.PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Server Error:', error);
    }
}
main();
