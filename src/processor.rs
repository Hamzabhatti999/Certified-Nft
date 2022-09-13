use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    program::invoke,
    msg
};

use crate::instruction::NftInstruction;
use spl_token::instruction::{initialize_mint2,initialize_account2,mint_to};
use mpl_token_metadata::{instruction::{create_metadata_accounts_v3,create_master_edition_v3,update_metadata_accounts_v2,set_and_verify_collection}, 
state::Creator};
pub struct Processor;

impl Processor{
    pub fn process(
        program_id: &Pubkey,
        accounts : &[AccountInfo],
        input: &[u8],
    )->ProgramResult{
        let instruction = NftInstruction::unpack(input)?;
        match instruction{
            NftInstruction::InitializeNft{amount} => Self::process_initialize_nft(program_id, accounts, amount),
            NftInstruction::VerifyCollection => Self::process_collection( program_id,accounts)
        }
    }
    pub fn process_initialize_nft(
        _program_id: &Pubkey,
        accounts : &[AccountInfo],
        amount: u64
    )->ProgramResult{
        let account_info = &mut accounts.iter();
        let token_id = next_account_info(account_info)?;
        let metadata_id = next_account_info(account_info)?;
        let sys_account = next_account_info(account_info)?;
        let mint_info = next_account_info(account_info)?;
        let token_account = next_account_info(account_info)?;
        let metadata_account = next_account_info(account_info)?;
        let edition_account = next_account_info(account_info)?;
        let rent = next_account_info(account_info)?;
        let authority = next_account_info(account_info)?;
        let new_auth = next_account_info(account_info)?;
        let creator = next_account_info(account_info)?;
     
        msg!("--1--");
        invoke(&initialize_mint2(
            &token_id.key,
            &mint_info.key,
            &authority.key,
            Some(&authority.key),
            0
        ).unwrap(), 
        &[
            token_id.clone(),
            mint_info.clone(),
            authority.clone(),
            rent.clone()
        ])?;
        msg!("--2--");
        invoke(&initialize_account2(
            &token_id.key,
            &token_account.key,
            &mint_info.key,
            &authority.key
        )?, 
        &[
            token_id.clone(),
            token_account.clone(),
            mint_info.clone(),
            authority.clone(),
            rent.clone()
        ])?;
        msg!("--3--");
        invoke(&mint_to(
            &token_id.key,
            &mint_info.key,
            &token_account.key,
            &authority.key,
            &[&authority.key],
            amount
        )?, 
        &[
            token_id.clone(),
            mint_info.clone(),
            token_account.clone(),
            authority.clone()
        ])?;
        msg!("--3--");
        invoke(&create_metadata_accounts_v3(
            *metadata_id.key,
            *metadata_account.key,
            *mint_info.key,
            *authority.key,
            *authority.key,
            *authority.key,
            "Hanno".to_string(),
            "@".to_string(),
            "*".to_string(),
            Some(vec![Creator{ 
                address: *authority.key,
                verified: true , 
                share: 50 }, 
                Creator{ 
                    address: *creator.key,
                    verified: false , 
                    share: 50 }, 
                ]),
            10,
            true,
            true,
            None,
            None,
            None
        ), 
        &[
            metadata_id.clone(),
            metadata_account.clone(),
            mint_info.clone(),
            authority.clone(),
            new_auth.clone(),
            sys_account.clone(),
            rent.clone()
        ])?;
        msg!("--4--");
        msg!("--META--{:?}",metadata_account.owner);
        invoke(&create_master_edition_v3(
            *metadata_id.key,
            *edition_account.key,
            *mint_info.key,
            *authority.key,
            *authority.key,
            *metadata_account.key,
            *authority.key,
            Some(0)
        ), 
        &[
            metadata_id.clone(),
            edition_account.clone(),
            mint_info.clone(),
            authority.clone(),
            metadata_account.clone(),
            token_id.clone(),
            sys_account.clone(),
            rent.clone()
        ])?;
        msg!("--5--");
        invoke(&update_metadata_accounts_v2(
            *metadata_id.key,
            *metadata_account.key,
            *authority.key,
            Some(*authority.key),
            None,
            Some(true),
            Some(false)
        ), 
        &[
            metadata_id.clone(),
            metadata_account.clone(),
            authority.clone()
        ])?;
         Ok(())
    }
    pub fn process_collection(
        program_id: &Pubkey,
        accounts : &[AccountInfo]
    )->ProgramResult{
        let account = &mut accounts.iter();
        let metadata_id = next_account_info(account)?;
        let metadata_account = next_account_info(account)?;
        let mint_info = next_account_info(account)?;
        let owner = next_account_info(account)?;
        let collection_account= next_account_info(account)?;
        let edition_account= next_account_info(account)?;
        msg!("mint ={:?}",mint_info.owner);
        msg!("META ={:?}",metadata_account.owner);
        msg!("collection ={:?}",collection_account.owner);
        msg!("edition ={:?}",edition_account.owner);

        invoke(&set_and_verify_collection(
            *metadata_id.key,
            *metadata_account.key,
            *owner.key,
            *owner.key,
            *owner.key,
            *mint_info.key,
            *collection_account.key,
            *edition_account.key,
            None
        ), &[
                metadata_id.clone(),
                metadata_account.clone(),
                owner.clone(),
                mint_info.clone(),
                collection_account.clone(),
                edition_account.clone(),
        ])?;
        
        Ok(())
    }
}

// // 8CkkyrtZmeNQ9swDWf2jWgMzbgutyVrSSFigs347A2Ru