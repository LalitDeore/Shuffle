const { Builder, By, until } = require('selenium-webdriver');

console.log('Starting Selenium script for testing pages...');

(async () => {
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(
            new (require('selenium-webdriver/chrome').Options)()
        )
        .build();

    const SuccessfullyLoadedPath = [];
    const FailedToLoadPath = [];

    try {
        await driver.manage().window().setRect({ width: 1600, height: 1200 });
        await driver.manage().setTimeouts({ implicit: 15000 });

        const frontendURL = process.argv[2];
        const routes = process.argv.slice(3);

        console.log('Frontend URL:', frontendURL);
        const isCloud = frontendURL === 'http://localhost:3002' || frontendURL === 'https://sandbox.shuffler.io' || frontendURL === 'https://shuffler.io';
       
        if (isCloud) {
            // Login Credentials
            const LOGIN_URL = `${frontendURL}/login`;
            const USERNAME = 'shuffle-testing@gmail.com';
            const PASSWORD = 'testing@123';

            console.log('Logging in...');
            await driver.get(LOGIN_URL);

            try {
                await driver.wait(until.elementLocated(By.css('#emailfield')), 10000);
                await driver.findElement(By.css('#emailfield')).sendKeys(USERNAME);

                await driver.wait(until.elementLocated(By.css('#outlined-password-input')), 10000);
                await driver.findElement(By.css('#outlined-password-input')).sendKeys(PASSWORD);

                await driver.wait(until.elementLocated(By.css('#loginButton')), 10000);
                await driver.findElement(By.css('#loginButton')).click();

                // Ensure login success by checking URL change
                await driver.wait(async () => {
                    const url = await driver.getCurrentUrl();
                    return url.includes('welcome');
                }, 20000);

                console.log('Successfully logged in!');
            } catch (error) {
                console.error('Login failed:', error.message);
                FailedToLoadPath.push(LOGIN_URL);
                await driver.quit();
                process.exit(1);
            }
        }else {
            // Steps for onprem testing
            // 1. Signup
            // 2. Login
            // 3. Create new workflow

            // const SIGNUP_URL = `${frontendURL}/AdminSetup`;
            // const USERNAME = 'shuffle-testing@gmail.com';
            // const PASSWORD = 'testing@123';

            const USERNAME = 'demo@demo.io';
            const PASSWORD = 'supercoolpassword';

            const WORKFLOW_URL = `${frontendURL}/workflows`;

            // console.log('Signing up...');
            // await driver.get(SIGNUP_URL);

            // skipping sign up part for now

            // try {
            //     await driver.wait(until.elementLocated(By.css('#emailfield')), 10000);
            //     await driver.findElement(By.css('#emailfield')).sendKeys(USERNAME);

            //     await driver.wait(until.elementLocated(By.css('#outlined-password-input')), 10000);
            //     await driver.findElement(By.css('#outlined-password-input')).sendKeys(PASSWORD);

            //     await driver.wait(until.elementLocated(By.css('#signupButton')), 10000);
            //     await driver.findElement(By.css('#signupButton')).click();

            //     // Ensure signup success by checking URL change
            //     await driver.wait(async () => {
            //         const url = await driver.getCurrentUrl();
            //         return url.includes('login');
            //     }, 20000);

            //    // Wait for document readiness
            //    await driver.wait(async () => {
            //     return await driver.executeScript('return document.readyState') === 'complete';
            // }, 10000);
    
            // const isParentPresent = await driver.wait(async () => {
            //     return await driver.executeScript(
            //         "return document.querySelector('.parent-component') !== null;"
            //     );
            // }, 5000).catch(() => false);
    
            // if (!isParentPresent) {
            //     const logs = await driver.manage().logs().get('browser');
            //     const severeErrors = logs.filter(log => log.level.name === 'SEVERE');
            //     if (severeErrors.length > 0) {
            //         const crashCausingErrors = severeErrors.filter(err => {
            //             return  !err.message.includes('Warning:') &&
            //                 !err.message.includes('MUI:') 
            //         });

            //         console.error(`Page (${SIGNUP_URL}) did not load correctly:`, crashCausingErrors);
            //         FailedToLoadPath.push(SIGNUP_URL);
            //     }
            // }

            //     console.log("Sign up")

            // } catch (error) {
            //     console.error('Signup or login failed:', error.message);
            //     FailedToLoadPath.push(SIGNUP_URL);
            //     await driver.quit();
            //     process.exit(1);
            // }

            try {
                // Login
            console.log('Logging in...');
            await driver.get(`${frontendURL}/login`);

            await driver.wait(until.elementLocated(By.css('#emailfield')), 10000);
            await driver.findElement(By.css('#emailfield')).sendKeys(USERNAME);

            await driver.wait(until.elementLocated(By.css('#outlined-password-input')), 10000);
            await driver.findElement(By.css('#outlined-password-input')).sendKeys(PASSWORD);

            await driver.wait(until.elementLocated(By.css('#loginButton')), 10000);
            await driver.findElement(By.css('#loginButton')).click();


             // Ensure signup success by checking URL change
             await driver.wait(async () => {
                const url = await driver.getCurrentUrl();
                return url.includes('welcome') || url.includes('workflows');
            }, 20000);


            const isParentPresent = await driver.wait(async () => {
                return await driver.executeScript(
                    "return document.querySelector('.parent-component') !== null;"
                );
            }, 5000).catch(() => false);
    
            if (!isParentPresent) {
                const logs = await driver.manage().logs().get('browser');
                const severeErrors = logs.filter(log => log.level.name === 'SEVERE');
                if (severeErrors.length > 0) {
                    const crashCausingErrors = severeErrors.filter(err => {
                        return  !err.message.includes('Warning:') &&
                            !err.message.includes('MUI:') 
                    });

                    console.error(`Page (${frontendURL}/login) did not load correctly:`, crashCausingErrors);
                    FailedToLoadPath.push(`${frontendURL}/login`);
                }
            }

            console.log('Successfully logged in!');

        } catch (error) {
            console.error('Failed to login:', error.message);
            FailedToLoadPath.push(WORKFLOW_URL);
            await driver.quit();
            process.exit(1);
        }

        try {
            // Create new workflow
            console.log('Creating new workflow...');
            await driver.get(WORKFLOW_URL);
            
            await driver.sleep(1000);
        
            await driver.wait(until.elementLocated(By.css('#create_workflow_button')), 10000);
            const create_workflow_button = await driver.findElement(By.css('#create_workflow_button'));
            
            await driver.sleep(1000);
            await create_workflow_button.click();
        
            await driver.sleep(1500);
        
            await driver.wait(until.elementLocated(By.css('#Enter-Workflow-Name')), 10000);
            const enter_workflow_name_field = await driver.findElement(By.css('#Enter-Workflow-Name'));
        
            await driver.sleep(1000);
            await enter_workflow_name_field.sendKeys("Test Workflow");
        
            // Wait before saving
            await driver.sleep(1500);
        
            await driver.wait(until.elementLocated(By.css('#save_workflow_button')), 10000);
            const save_workflow_button = await driver.findElement(By.css('#save_workflow_button'));
        
            await driver.sleep(1000); // Delay before clicking
            await save_workflow_button.click();
        
            // Wait for the parent component to appear
            await driver.sleep(2000);
        
            const isParentPresent = await driver.wait(async () => {
                return await driver.executeScript(
                    "return document.querySelector('.parent-component') !== null;"
                );
            }, 5000).catch(() => false);
        
            if (!isParentPresent) {
                const logs = await driver.manage().logs().get('browser');
                const severeErrors = logs.filter(log => log.level.name === 'SEVERE');
                if (severeErrors.length > 0) {
                    const crashCausingErrors = severeErrors.filter(err => {
                        return !err.message.includes('Warning:') &&
                               !err.message.includes('MUI:');
                    });
        
                    console.error(`Page (${WORKFLOW_URL}) did not load correctly:`, crashCausingErrors);
                    FailedToLoadPath.push(`${WORKFLOW_URL}`);
                }
            }
        
        } catch (error) {
            console.error('Failed to create new workflow:', error.message);
            FailedToLoadPath.push(WORKFLOW_URL);
            await driver.quit();
            process.exit(1);
        }            
        }

        // Get routes from command line arguments
        if (routes.length === 0) {
            console.error('No routes found to test.');
            await driver.quit();
            process.exit(1);
        }
        console.log(`Found ${routes.length} routes to test.`);

        for (const route of routes) {
            const url = `${frontendURL}/${route}`;
            console.log(`Testing route: ${url}`);
        
            try {
                await driver.get(url);
                await driver.sleep(3000);
        
                // Wait for document readiness
                await driver.wait(async () => {
                    return await driver.executeScript('return document.readyState') === 'complete';
                }, 10000);
        
                const isParentPresent = await driver.wait(async () => {
                    return await driver.executeScript(
                        "return document.querySelector('.parent-component') !== null;"
                    );
                }, 5000).catch(() => false);
        
                if (!isParentPresent) {
                    const logs = await driver.manage().logs().get('browser');
                    const severeErrors = logs.filter(log => log.level.name === 'SEVERE');
                    if (severeErrors.length > 0) {
                        const crashCausingErrors = severeErrors.filter(err => {
                            return  !err.message.includes('Warning:') &&
                                !err.message.includes('MUI:') 
                        });

                        console.error(`Page (${url}) did not load correctly:`, crashCausingErrors);
                        FailedToLoadPath.push(url);
                    }
                    continue;
                }
        
                console.log(`Successfully loaded: ${url}`);
                SuccessfullyLoadedPath.push(url);
            } catch (error) {
                console.error(`Failed to load ${url}:`, error.message);
            }
        }            
    } finally {
        console.log("Total pages tested: ", SuccessfullyLoadedPath.length + FailedToLoadPath.length);
        console.log("Successfully loaded pages: ", SuccessfullyLoadedPath.length);
        if (FailedToLoadPath.length > 0) {
            console.log("Failed to load pages: ", FailedToLoadPath.length);
            console.log("Failed to load pages paths: ", FailedToLoadPath);
        }else {
            console.log("No pages failed to load. Congrats!");
        }
        await driver.quit();
    }
})();