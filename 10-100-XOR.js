/**
 * XOR
 *
 * XOR crypto challenge.
 *
 * Key Length: 6
 *
 * 2026076e06003d2d096e15073b390c6e111a2c6e083b1a05276e0d381207743a0a2b571935341b6e131a33
 *
 * Submit the decryption key.
 *
 * (The key only contains alpha-numeric characters.)
 * (The decrypted message is 'the quick brown fox jumps over the lazy dog'.)
 */

function byteStringToArray(data) {
  let result = [];
  for (let i = 0; i < data.length; i += 2) {
    result.push(parseInt(data.substring(i, i + 2), 16));
  }
  return result;
}

function groupBytesByKeyLength(dataBytes, keyLength) {
  let result = [];
  for (let i = 0; i < keyLength; i++) {
    result[i] = [];
  }
  let i = 0;
  dataBytes.forEach(b => {
    result[i].push(b);
    i++;
    if (i >= keyLength) {
      i = 0;
    }
  });
  return result;
}

function testOneByteXorKey(oneGroupedBytes, oneKeyByte) {
  let result = true;
  oneGroupedBytes.forEach(b => {
    let ch = String.fromCharCode(b ^ oneKeyByte);
    if (!(/[\w ,.'!]/.test(ch))) {
      result = false;
    }
  });
  return result;
}

function guessOneByteXorKey(oneGroupedBytes) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let result = [];
  chars.forEach(ch => {
    if (testOneByteXorKey(oneGroupedBytes, ch.charCodeAt(0))) {
      result.push(ch);
    }
  });
  return result;
}

function guessAllBytesXorKey(groupedBytes) {
  let result = [];
  groupedBytes.forEach(oneGroupedBytes => {
    result.push(guessOneByteXorKey(oneGroupedBytes));
  });
  return result;
}

function generateXorKey(keyBytes, i) {
  let result = '';
  keyBytes.forEach(keyByte => {
    let index = i % keyByte.length;
    result += keyByte[index];
    i -= index;
    i /= keyByte.length;
  });
  return result;
}

function xorDecrypt(dataBytes, key) {
  let result = '';
  let i = 0;
  dataBytes.forEach(b => {
    let ch = String.fromCharCode(b ^ key.charCodeAt(i));
    result += ch;
    i++;
    if (i >= key.length) {
      i = 0;
    }
  });
  return result;
}

function testIsEnglish(sentence) {
  let sanitizedSentence = sentence
    .replace('\'s', ' ')
    .replace('\'re', ' ')
    .replace('\'d', ' ')
    .replace('n\'t', ' ')
    .replace(/\W/g, ' ')
    .replace(/ +/g, ' ');
  let words = sanitizedSentence.split(' ');
  let matchedWords = 0;
  let matchedLength = 0;
  words.forEach((word) => {
    let matched = false;
    if (englishCommonWords.indexOf(word) >= 0) {
      matched = true;
    } else if (word.endsWith('s')) {
      if (englishCommonWords.indexOf(word.replace(/s$/, '')) >= 0) {
        matched = true;
      } else if (word.endsWith('es')) {
        if (englishCommonWords.indexOf(word.replace(/es$/, '')) >= 0) {
          matched = true;
        } else if (word.endsWith('ies') && englishCommonWords.indexOf(word.replace(/ies$/, 'y')) >= 0) {
          matched = true;
        }
      }
    } else if (word.endsWith('d')) {
      if (englishCommonWords.indexOf(word.replace(/d$/, '')) >= 0) {
        matched = true;
      } else if (word.endsWith('ed')) {
        if (englishCommonWords.indexOf(word.replace(/ed$/, '')) >= 0) {
          matched = true;
        } else if (word.endsWith('ied') && englishCommonWords.indexOf(word.replace(/ied$/, 'y')) >= 0) {
          matched = true;
        }
      }
    } else if (word.endsWith('ing')) {
      if (englishCommonWords.indexOf(word.replace(/ing$/, '')) >= 0) {
        matched = true;
      }
    }
    if (matched) {
      matchedWords++;
      matchedLength += word.length;
    }
  });
  return (matchedWords + matchedLength / sentence.replace(/\W/g, '').length) / (words.length + 1);
}

function tryXOR(dataBytes, keyBytes, keyCount) {
  let max = 0;
  let resultSentence = '';
  let result = '';
  let j = 0;
  for (let i = 0; i < keyCount; i++) {
    let key = generateXorKey(keyBytes, i);
    let sentence = xorDecrypt(dataBytes, key);
    let similarity = testIsEnglish(sentence);
    if (similarity > max) {
      console.log(sentence, similarity);
      max = similarity;
      resultSentence = sentence;
      result = key;
    }
    if (++j >= 100) {
      console.log(i, keyCount);
      j = 0;
    }
  }
  console.log(result, resultSentence);
  return result;
}

function solveXOR(data, keyLength) {
  let dataBytes = byteStringToArray(data);
  console.log(dataBytes);
  let groupedBytes = groupBytesByKeyLength(dataBytes, keyLength);
  let keyBytes = guessAllBytesXorKey(groupedBytes);
  let keyCount = 1;
  keyBytes.forEach(keyByte => {
    keyCount *= keyByte.length;
  });
  return tryXOR(dataBytes, keyBytes, keyCount);
}

console.log(solveXOR('081d1d473305310b1a4776482f1d49463f482c17025076483417015f7a092c580f143d04390b1d143907360c0f5d3401361f4e016a4d781907467a09361c4e016a4d780f0f403f1a781900507a1b3d1d4e5d2e48390b4e5c3b043e580b592a1c21564e1415182c11035d291c2b544e5d34483b17004028092b0c4214290d3d5807407a092b580655360e781e1b58364678582b5a3d01361d0b4629447817081439072d0a1d5176482d160a51281b2c1900507a1c301d4e5336092b0b4e5d29482c0f07573f48390b4e56330f78191d14331c78160b513e1b780c0114380d76', 6));
