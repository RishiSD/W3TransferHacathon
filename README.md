# W3Transfer

<img width="326" alt="Screenshot 2024-06-04 at 16 11 12" src="https://github.com/RishiSD/W3TransferHacathon/assets/14894488/76eaeb10-c3da-4b34-aaa7-e824285dceed">



W3Transfer is a decentralised file sharing platform built on Polkadot powered by the [Apillion](https://apillon.io/) platform.
Its like WeTransfer but better since the files that are shared are stored encrypted and decentralised, such that they can only be decrypted by signature of the receiver.


# Technologies Used

Apillion Services: Authentication, NFTs, Computing, Hosting

Frontend: React, Tailwind CSS, viem, wagmi

Backend: Expressjs, @apillon/sdk, viem, resend

# Architecture Diagram
![w3transfer](https://github.com/RishiSD/W3TransferHacathon/assets/14894488/747e7e07-3835-4563-8287-417d931f7d80)

Note: All rights to the logos are owned by the respective companies.

# Aplication Details

Pre-requisites: A new NFT Collection was created on Apillion dashboard, a new computing contract for Schrödingers NFT was also created where the NFT collection was linked.

The first point of contact for the user is the frontend which is a react application that is hosted using Apillion hosting solution on IPFS via [CRUST](https://www.crust.network/).

The frontend establishes an OAuth connection with the backend using Apillion Authentication. The backend is hosted on [render](https://render.com/) and backend endpoints are secured with OAuth/JWT token which is saved in the browser frontend as cookie after successful login. 

![image](https://github.com/RishiSD/W3TransferHacathon/assets/14894488/a76fe3b7-504c-42ef-b22b-c81fbddb8241)

After successful login the send button is enabled and the email of the logged in user is displayed. The user then uploads the file and fills the form with the email id of the receiver, a message that should be sent in the email and the Ethereum wallet address of the receiver.

On clicking send the frontend calls the backend `/transfer` endpoint which uses apillion sdk to interact with the computing schrödingers NFT contract on [PHALA](https://phala.network/) network. This api call would basically encrypt the file and save the encrypted file on IPFS via CRUST, mint an NFT to the receiver address, assigns the CID from IPFS to the minted NFT id on the Schrödingers contract and send an email to the receiver with the details.

![image](https://github.com/RishiSD/W3TransferHacathon/assets/14894488/00bcfe09-19d3-404c-b59d-85330ba16e9e)

Clicking 'Get the file' button in the email will redirect the receiver to the download page. Here the receiver needs to connect Ethereum user wallet address mentioned in the email. Once connected the download button will be enabled clicking on which will ask the user to sign a message. Once the message is verified the user is prompted to save the decrypted file. If the user connects with a different wallet address then an error message will be displayed.

![image](https://github.com/RishiSD/W3TransferHacathon/assets/14894488/1a09e022-0c86-41ef-81a1-e6f182b46a00)


# Run in local

Create a new NFT Collection in Apillion Dashboard. Create a new computing contract for Schrödingers NFT and connect it with the NFT collection created previously.
Create an API key in the dashboard to be used in the backend .env.

Clone the project

```
git clone https://github.com/RishiSD/W3TransferHacathon.git
```

To run the backend

```
cd backend
npm install
# rename .env.sample to .env and update the env variable values
np run dev
```

To run the frontend
```
cd frontend
npm install
npm run dev
```

