import Aes from 'react-native-aes-crypto'

export const generateKey = (password, salt, cost, length) => Aes.pbkdf2(password, salt, cost, length)

export const encryptData = (text, key) => {
    return Aes.randomKey(16).then(iv => {
        return Aes.encrypt(text, key, iv, 'aes-256-cbc').then(cipher => ({ 
            cipher,
            iv,
        }))
    })
}

export const decryptData = (encryptedData, key) => Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-256-cbc')

try {
    generateKey('Arnold', 'salt', 5000, 256).then(key => {
        encryptData('These violent delights have violent ends', key)
            .then(({ cipher, iv }) => {
                decryptData({ cipher, iv }, key)
                    .then(text => {
                    })
                    .catch(error => {
                    })

                Aes.hmac256(cipher, key).then(hash => {
                })
            })
            .catch(error => {
            })
    })
} catch (e) {
}