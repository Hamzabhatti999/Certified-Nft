use std::convert::TryInto;

use solana_program::{
    program_error::ProgramError
};
use crate::error::NftError;

pub enum NftInstruction{
    InitializeNft{
        amount: u64
    },
    VerifyCollection
}
impl NftInstruction {
    pub fn unpack(input:&[u8])->Result<Self,ProgramError>{
        use NftError::InvalidInstruction;
        let (&tag,rest) = input.split_first().ok_or(InvalidInstruction)?;
        Ok(match tag{
            0 =>{
                let amount = rest
                .get(..8)
                .and_then(|slice|slice.try_into().ok())
                .map(u64::from_le_bytes)
                .ok_or(InvalidInstruction)?;

                Self::InitializeNft {amount}
            }
           1=> {
                Self::VerifyCollection
           }
            _=> return Err(NftError::InvalidInstruction.into())
        })
    }
}