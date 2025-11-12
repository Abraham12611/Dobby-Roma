import axios from "axios";
import chalk from "chalk";

const start = async() => {
    try {
        const response = await axios.post("https://app.chainsim.io/api/v1/mint", {
            "referrer": "0:002774b0da31b843baef0a58ea82c7cc1323cb06fd266838e33f041b09a2bd4c"
        });
        
        const phoneNumber = response.data.phone_number.phone_number;
        
        console.log(response.data.phone_number.formatted_phone_number)
        if(phoneNumber.length > 0){
            // Check if phone number contains more than 5 identical digits
            const digitCounts: { [key: string]: number } = {};
            for (let digit of phoneNumber) {
                if (digit >= '0' && digit <= '9') {
                    digitCounts[digit] = (digitCounts[digit] || 0) + 1;
                }
            }
            
            // Check if any digit appears more than 5 times
            for (let digit in digitCounts) {
                if (digitCounts[digit] > 5) {
                    console.log(response.data)
                    console.log(chalk.red(`Phone number contains more than 5 identical digits: ${digit} appears ${digitCounts[digit]} times`));
                    console.log(chalk.yellow(`Phone number: ${phoneNumber}`));
                    break;
                }
            }
        }
    } catch (error: any) {
        if (error.response) {
            console.log(chalk.red("Error: "), error.response.status);
        }
    }
}

while(true){
    // Run 10 instances of start() concurrently using Promise.all()
    const promises = Array.from({ length: 20 }, () => 
        start().catch(_err => {
            // console.log(chalk.red("Error: "), err);
        })
    );
    
    await Promise.all(promises);
    await new Promise(resolve => setTimeout(resolve, 1000));
}
