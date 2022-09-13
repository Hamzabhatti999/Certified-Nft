import {
    PublicKey,
    TransactionInstruction,
    Connection,
    Keypair,
    sendAndConfirmTransaction,
    Transaction,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    clusterApiUrl,
  } from '@solana/web3.js';
  import {TOKEN_PROGRAM_ID,MintLayout,AccountLayout} from '@solana/spl-token';
  import {struct,u8} from '@solana/buffer-layout';
  import{u64} from '@solana/buffer-layout-utils'

  let connection = new Connection(clusterApiUrl('devnet'),('confirmed'));
  export function ownerpayer(){
    const secretkeyString = "[247,189,107,250,123,42,136,202,28,216,82,61,99,171,248,153,29,170,190,207,11,27,242,71,64,209,215,72,157,236,121,190,77,254,142,12,112,193,209,187,105,255,28,118,180,217,78,121,177,29,50,204,186,43,83,147,119,17,69,255,61,99,135,3]";
    const secretKey = Uint8Array.from(JSON.parse(secretkeyString));
    return Keypair.fromSecretKey(secretKey);
}
export interface instruction{
    instruction: number,
    amount: bigint
  }
  export const instructData= struct<instruction>([
    u8('instruction'),
    u64('amount')
  ]);
  async function NftInstruction(ProgramId:PublicKey,Mintkey:Keypair,Tokenkey:Keypair) {
    
    const mintLamport = await connection.getMinimumBalanceForRentExemption(MintLayout.span);
    const tokenLamport = await connection.getMinimumBalanceForRentExemption(AccountLayout.span)
    let payer = ownerpayer()
    let tx = new Transaction()
    tx.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: Mintkey.publicKey,
        lamports: mintLamport,
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID
    }))
    tx.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: Tokenkey.publicKey,
        lamports: tokenLamport,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID
    }))
    let Metadata_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
    let metadata_account = await PublicKey.findProgramAddress([
        Buffer.from('metadata', 'utf-8'),
        Metadata_ID.toBuffer(),
        Mintkey.publicKey.toBuffer() ],
        Metadata_ID)
    let edition_account = await PublicKey.findProgramAddress([
        Buffer.from('metadata', 'utf-8'),
        Metadata_ID.toBuffer(),
        Mintkey.publicKey.toBuffer(),
        Buffer.from('edition', 'utf-8')],
        Metadata_ID)
        console.log("mint =",Mintkey.publicKey.toBase58())
        console.log("token =",Tokenkey.publicKey.toBase58())
    const instructionLayout = Buffer.alloc(instructData.span);
    instructData.encode({
        instruction: 0,
        amount: BigInt(1)
    },instructionLayout)
    let accounts = [
        {pubkey: TOKEN_PROGRAM_ID,isSigner: false,isWritable: false},
        {pubkey: Metadata_ID,isSigner: false,isWritable: false},
        {pubkey: SystemProgram.programId,isSigner: false,isWritable: false},
        {pubkey: Mintkey.publicKey,isSigner: true,isWritable: true},
        {pubkey: Tokenkey.publicKey,isSigner: true,isWritable: true},
        {pubkey: metadata_account[0],isSigner: false,isWritable: true},
        {pubkey: edition_account[0],isSigner: false,isWritable: true},
        {pubkey: SYSVAR_RENT_PUBKEY,isSigner: false,isWritable: false},
        {pubkey: payer.publicKey,isSigner: true,isWritable: true},
        {pubkey: payer.publicKey,isSigner: true,isWritable: true},
        {pubkey: new PublicKey("9a4cvBscacQWr3jLWRhMxGas7bVSCMvd7rdkRsPTttMr"),isSigner: false,isWritable: false}
    ];
    
    tx.add(new TransactionInstruction({
        keys: accounts,programId: ProgramId, data: instructionLayout
    }))
    //let a = await connection.simulateTransaction(tx,[payer,Mintkey,Tokenkey]);
    //console.log(a.value)
    let sign = await sendAndConfirmTransaction(connection,tx,[payer,Mintkey,Tokenkey])
    console.log("Signature =", sign)
  }
  export interface collection{
    instruction: number
  }
  export const collectiondata = struct<collection>([
    u8('instruction')])
  async function setCollection(programID: PublicKey,mintKey:PublicKey) {
    
    const collectionStruct = Buffer.alloc(collectiondata.span);

    collectiondata.encode({
        instruction: 1
    },collectionStruct)

  let tx= new Transaction()
  let owner = ownerpayer()
  let Metadata_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const metadata_account = await PublicKey.findProgramAddress(
    [Buffer.from('metadata', 'utf8'),
    Metadata_ID.toBuffer(),
    mintKey.toBuffer()
    ],
    Metadata_ID
    )

  let accounts = [
    { pubkey: Metadata_ID,isSigner: false ,isWritable: false},
    { pubkey: metadata_account[0],isSigner: false ,isWritable: true},
    { pubkey: new PublicKey("AtyZMF6BHyt62DzrGmHsryhLw2wkw9FZ3DaFwSQPRdyG"),isSigner: false ,isWritable: true},
    { pubkey: owner.publicKey ,isSigner: true ,isWritable: true},
    { pubkey: new PublicKey("32cky36ionkRxw7cdNAA6HKdXqVG44AV7ZutLqRkRyR2"),isSigner: false ,isWritable: true},
    { pubkey: new PublicKey("9z7ADD1inCfheTkC6abdVxEr4nsAFEGJxbyhgLtXJk3b"),isSigner: false ,isWritable: true},
    ];
    tx.add(new TransactionInstruction({
    keys: accounts,programId:programID, data:collectionStruct
    }))
    // let a = await connection.simulateTransaction(tx,[owner])
    // console.log(a);
  let sign = await sendAndConfirmTransaction(connection,tx,[owner])
  console.log("signature",sign)
  }

  async function main() {
    const ProgramId = new PublicKey("6cmbx18k2GFtMGoaiR1CifowKBHo2Jq3d3w696jGXBb1")

    let Mintkey = Keypair.generate()
    let Tokenkey = Keypair.generate()
    await NftInstruction(ProgramId,Mintkey,Tokenkey)
     await setCollection(ProgramId,Mintkey.publicKey)
  }
  main()
