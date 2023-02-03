import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {Controller} from './controller';
import {API, SERVER_LINK} from '../../config';
import DeviceInfo from 'react-native-device-info';
import { PermissionsAndroid } from 'react-native';
import { io } from 'socket.io-client';
import Axios from 'axios';

const Home = (props) => {
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [androidId, setAndroidId] = useState(null);
    const [otp, setOtp] = useState('- - - -');
    const socket = io(SERVER_LINK) //Setup socket.io

    //Get phone number & start read sms listen & request perms
    useEffect(() => { 
        requestPermissions.then(async (res) => {
            //setPhoneNumber(res.number);
            setAndroidId(res.phoneId);

            let data = {
                phoneId: res.phoneId
            }
    
            Axios.post(`${API}/renew`, data).then(() => {
                //Send otp to server
                socket.emit("@user-renew-phone");
            }).catch(e => alert(e));

            //Get phone data
            Axios.get(`${API}/get_phone/${data.phoneId}`).then((result) => {
                setPhoneNumber(result.data.number);
            })

            socket.on("@server-update-phone", () => {
                //Get phone data
                Axios.get(`${API}/get_phone/${data.phoneId}`).then((result) => {
                    setPhoneNumber(result.data.number);
                })
            })

            socket.on("@server-update-otp", () => {
                //Get phone data
                Axios.get(`${API}/get_phone/${data.phoneId}`).then((result) => {
                    setOtp(result.data.otp);
                })
            })
        });
    }, []);

    //Request perimssions
    const requestPermissions = new Promise(async (resolve, reject) => {
        try {
            const grantedPhoneState = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                {
                  title: "Cho phép truy cập quyền đọc điện thoại",
                  message:
                    "" +
                    "",
                  buttonNeutral: "Ask Me Later",
                  buttonNegative: "Cancel",
                  buttonPositive: "OK"
                }
            );

            const grantedReceiveSms = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
                {
                  title: "Cho phép truy cập quyền nhận sms",
                  message:
                    "" +
                    "",
                  buttonNeutral: "Ask Me Later",
                  buttonNegative: "Cancel",
                  buttonPositive: "OK"
                }
            );

            const grantedReadSms = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_SMS,
                {
                  title: "Cho phép truy cập quyền đọc sms",
                  message:
                    "" +
                    "",
                  buttonNeutral: "Ask Me Later",
                  buttonNegative: "Cancel",
                  buttonPositive: "OK"
                }
            );

            if(grantedPhoneState !== PermissionsAndroid.RESULTS.GRANTED) {
                alert('Bạn chưa cấp quyền đọc sdt')
            }else if(grantedReceiveSms !== PermissionsAndroid.RESULTS.GRANTED) {
                alert('Bạn chưa cấp quyền nhận sms')
            }else if(grantedReadSms !== PermissionsAndroid.RESULTS.GRANTED) {
                alert('Bạn chưa cấp quyền đọc sms')
            }else{
                let data =  {
                    number: null,
                    phoneId: null
                }

                //Get phone number
                await DeviceInfo.getPhoneNumber().then((phoneNumber) => {
                    data.number = phoneNumber;
                    //setPhoneNumber(phoneNumber);
                }).catch(e => {
                    alert(e);
                })

                //Get android  id
                await DeviceInfo.getAndroidId().then((androidId) => {
                    data.phoneId = androidId
                    //setAndroidId(androidId);
                }).catch(e => {
                    alert(e);
                })

                resolve(data);
            }
        }catch(e) {
            alert(e);
        }
    });

    //Submit  renew
    const handleRenewPhone = async () => {
        let data = {
            phoneId: androidId
        }

        await Axios.post(`${API}/renew`, data).then(() => {
            //Send otp to server
            socket.emit("@user-renew-phone");

            alert('Renew thành công!');
        })
    }

    return (
        <View style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%'
        }}>
            <Text style={{
                marginBottom: 16,
                fontSize: 64
            }}>{otp}</Text>
            <View>
                <Text>ID Thiết bị: {androidId}</Text>
                <Text>SDT: {phoneNumber}</Text>
            </View>
            <TouchableOpacity onPress={handleRenewPhone} style={{
                backgroundColor: '#007aff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
                borderRadius: 8,
                marginTop: 24
            }}>
                <Text style={{color: '#fff'}}>Renew phone information</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Home;
