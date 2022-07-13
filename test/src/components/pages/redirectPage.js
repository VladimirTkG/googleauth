
import { Grid, Box, Typography, TextField, OutlinedInput, InputAdornment, IconButton, Button, Link, Menu, MenuItem, Dialog, getTableCellUtilityClass } from '@mui/material';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const RedirectPage = ({ loading }) => {
    const navigate = useNavigate();
    const GOOGLE_AUTH_URI = 'https://accounts.google.com/o/oauth2/auth';

    const GOOGLE_CLIENT_ID = '214238479226-oss7l4kjcn86esb68b64qp9fonju82sq.apps.googleusercontent.com';

    const GOOGLE_REDIRECT_URI = 'http://localhost:3000/authPage';

    const parameters = {
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'response_type': 'code',
        'client_id': GOOGLE_CLIENT_ID,
        'scope': 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.readonly',
    };

    const uri = `${GOOGLE_AUTH_URI}?redirect_uri=${parameters.redirect_uri}&response_type=${parameters.response_type}&client_id=${parameters.client_id}&scope=${parameters.scope}`;


    const [dataUser, setDataUser] = React.useState()

    React.useEffect(() => {
        if (!localStorage.getItem('token')) {
            window.location = uri
        } else {
            const configs = {
                method: 'get',
                url: 'http://localhost:3101/user/users',
            }
            axios(configs)
                .then(resp => {
                    console.log(resp)
                })
                .catch(err => { console.log(err) })
        }
    }, [])


    const responseGoogle = (response) => {
        console.log(response);
    }

    // React.useEffect(() => {
    //     if (loading) {
    //         setTimeout(loo, 1000)

    //     }
    // }, [loading])

    // const btnRef = React.useRef();

    // const loo = () => {
    //     console.log(btnRef);
    //     btnRef.click()
    // }

    // const login = useGoogleLogin({
    //     onSuccess: tokenResponse => {
    //         localStorage.setItem('token', tokenResponse.access_token)
    //         navigate('/homePage')
    //         console.log(tokenResponse)
    //     },
    //     scope: parameters.scope
    // });


    return (
        <Box sx={{ height: '100vh', bgcolor: '#000' }}>
            {/* <Button ref={btnRef} color='secondary' sx={{ width: '200px', height: '50px' }} onClick={login}>Sing in</Button>
            <GoogleLogin
                onSuccess={credentialResponse => {
                    console.log(credentialResponse);
                    localStorage.setItem('token', credentialResponse.credential)
                    navigate('/homePage')
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
            // auto_select
            />; */}
            {/* <Typography component='a' href={uri}> Click to autorize</Typography> */}
            {/* <GoogleLogin
                clientId={GOOGLE_CLIENT_ID}
                // redirectUri={GOOGLE_REDIRECT_URI}
                buttonText="Login"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
            // scope={parameters.scope}
            // cookiePolicy={'single_host_origin'}
            /> */}

        </Box>
    )
}

export default RedirectPage;