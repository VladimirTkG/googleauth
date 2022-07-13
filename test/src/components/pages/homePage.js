import { Grid, Box, Typography, TextField, OutlinedInput, InputAdornment, IconButton, Button, Link, Menu, MenuItem, Dialog, getTableCellUtilityClass } from '@mui/material';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
// import { google } from 'googleapis';

const HomePage = () => {
    const GOOGLE_SCOPES = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const [searchParams, setSearchParams] = useSearchParams();
    const [token, setToken] = React.useState(localStorage.getItem('token'));
    const [credentialsGoogle, setCredentialsGoogle] = React.useState()
    const [data, setData] = React.useState();

    const [code, setIndustry] = React.useState(searchParams.get('code'));
    const GOOGLE_AUTH_URI = 'https://accounts.google.com/o/oauth2/auth';

    const GOOGLE_TOKEN_URI = 'https://accounts.google.com/o/oauth2/token';

    const GOOGLE_USER_INFO_URI = 'https://www.googleapis.com/oauth2/v1/userinfo';

    const GOOGLE_CLIENT_ID = '214238479226-oss7l4kjcn86esb68b64qp9fonju82sq.apps.googleusercontent.com';

    const GOOGLE_CLIENT_SECRET = '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';

    const GOOGLE_REDIRECT_URI = 'http://localhost:3000/homePage';


    const navigate = useNavigate();

    const parameters = {
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code',
        'code': code,
    };
    // console.log(code)
    React.useEffect(() => {
        // if (code) {
        //     const config = {
        //         method: 'post',
        //         url: `${GOOGLE_TOKEN_URI}?client_id=${parameters.client_id}&client_secret=${parameters.client_secret}&redirect_uri=${parameters.redirect_uri}&grant_type=${parameters.grant_type}&code=${parameters.code}`,
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded'
        //         }
        //     }
        //     axios(config)
        //         .then(res => {
        //             console.log(res.data);
        //             localStorage.setItem('token', res.data.access_token);
        //             setCredentialsGoogle(res.data)
        //             setToken(res.data.access_token);
        //             navigate('/homePage')
        //         })
        //         .catch(err => console.log(err))
        // }
    }, [code])


    React.useEffect(() => {
        if (token) {
            const config = {
                method: 'get',
                url: GOOGLE_USER_INFO_URI,
                headers: {
                    // authorization: `Bearer ${token}`
                    'Authorization': `Bearer ${token}`
                }
            }
            axios(config)
                .then(res => {
                    console.log(res.data)
                    setData(JSON.stringify(res.data))
                })
                .catch(err => console.log(err))
                // const oAuth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
                // oAuth2Client.setCredentials(credentialsGoogle);
                // const auth = oAuth2Client;

            // const gmail = google.gmail({ version: 'v1', auth });

            // gmail.users.messages.list({
            //     userId: 'me',
            //     maxResults: 50,
            //     q: `{from:irm@dkv.global to:irm@dkv.global }`
            // }, (err, res) => {
            //     if (err) return console.log('The API returned an error: ' + err);
            //     const message = res.data.messages;
            //     setData(JSON.stringify(message))
            //     // getMessageBody(message, auth)
            // })
                const configf = {
                    method: 'get',
                    url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
                    headers: {
                        // authorization: `Bearer ${token}`
                        'Authorization': `Bearer ${token}`
                    }
                }
                axios(configf)
                    .then(res => {
                        console.log(res.data)
                        setData(JSON.stringify(res.data))
                    })
                    .catch(err => console.log(err))
            }

        }, [token])

    return (
        <Box>
            {data && <Typography>{data}</Typography>}
        </Box>
    )
}

export default HomePage;