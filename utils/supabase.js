import axios from 'axios';

export const insertData = (data) => {
    return new Promise((resolve, reject) => {
        axios.post('https://looagqkcudayuksqmuck.supabase.co/rest/v1/test-data',
            {
                "data": data
            },
            {
                headers: {
                    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2MzQ0OTU5LCJleHAiOjE5NTE5MjA5NTl9.Yl4gox2_jbH8YUTVfWsoutijzOsE83y7-8pPGt-SdJc",
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2MzQ0OTU5LCJleHAiOjE5NTE5MjA5NTl9.Yl4gox2_jbH8YUTVfWsoutijzOsE83y7-8pPGt-SdJc",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal",
                }
            }
        ).then(r => {
            resolve(null)
        }).catch(err =>  {
            console.log("Error inserting data", err)
            reject(err)
        });
    })
}