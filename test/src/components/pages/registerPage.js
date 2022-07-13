import { Box, CircularProgress } from "@mui/material";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import axios from 'axios';


const RegisterPage = () => {


    const [searchParams, setSearchParams] = useSearchParams();

    const [code, setCode] = React.useState(searchParams.get('code'));

    const navigate = useNavigate();

    const GOOGLE_TOKEN_URI = 'https://accounts.google.com/o/oauth2/token';
    const GOOGLE_CLIENT_ID = '214238479226-oss7l4kjcn86esb68b64qp9fonju82sq.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = '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';
    const GOOGLE_REDIRECT_URI = 'http://localhost:3000/authPage';
    const createUser = () => {
        if (code) {
            const codegmail = code;
            const configs = {
                method: 'post',
                url: 'http://localhost:3101/user/createUser',
                headers: {
                    codegmail
                },
            }
            axios(configs)
                .then(resp => {
                    localStorage.setItem('token', code);
                    console.log(resp)
                    navigate('/')
                })
                .catch(err => {
                    console.log(err)
                    // navigate('/')
                })
            // const parameters = {
            //     'client_id': GOOGLE_CLIENT_ID,
            //     'client_secret': GOOGLE_CLIENT_SECRET,
            //     'redirect_uri': GOOGLE_REDIRECT_URI,
            //     'grant_type': 'authorization_code',
            //     'code': code,
            // };
            // const config = {
            //     method: 'post',
            //     url: `${GOOGLE_TOKEN_URI}?client_id=${parameters.client_id}&client_secret=${parameters.client_secret}&redirect_uri=${parameters.redirect_uri}&grant_type=${parameters.grant_type}&code=${parameters.code}`,
            //     headers: {
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     }
            // }
            // axios(config)
            //     .then(res => {
            //         const configs = {
            //             method: 'post',
            //             url: 'http://localhost:3101/user/createUser',
            //             headers: {
            //                 'token': `${res.data.token_type} ${res.data.access_token}`
            //             },
            //             data: res.data
            //         }
            //         axios(configs)
            //             .then(resp => {
            //                 localStorage.setItem('token', res.data.access_token);
            //                 console.log(resp)
            //                 navigate('/')
            //             })
            //             .catch(err => {
            //                 console.log(err)
            //                 navigate('/')
            //             })
            //     })
            //     .catch(err => {
            //         console.log(err)
            //         navigate('/')
            //     })
            //     const config = {
            //         method: 'post',
            //         url: `http://localhost:3101/user/createUser`,
            //         headers: {
            //             codeGmail: code
            //         }
            //     }
            //     axios(config)
            //         .then(res => {
            //             console.log(res.data);
            //             navigate('/homePage')
            //         })
            //         .catch(err => console.log(err))
            // }
        }
    }

    setTimeout(createUser, 2000)

    return (
        <Box sx={{ bgcolor: '#000', height: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: '20%' }}>
                <CircularProgress size="100px" />
            </Box>
        </Box>
    )
}

export default RegisterPage;