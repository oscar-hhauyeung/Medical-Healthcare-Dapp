// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import '@openzeppelin/contracts/access/Ownable.sol';

contract EMedic is ERC20 { // <--- ERC20 is a contract that is already defined in OpenZeppelin
    constructor() ERC20('EMedic', 'EMEDIC') { 
        _mint(msg.sender, 1000000000000000000000000 * 10 ** decimals()); 
    }
}

