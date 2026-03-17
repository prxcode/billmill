export function numberToWords(amount: number, currency: string = 'QAR'): string {
    const [integerPart, decimalPart] = amount.toFixed(2).split('.');
    const integer = parseInt(integerPart, 10);
    const decimal = parseInt(decimalPart, 10);

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Million', 'Billion'];

    function convertGroup(n: number): string {
        let word = '';

        if (n >= 100) {
            word += units[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }

        if (n >= 20) {
            word += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }

        if (n > 0) {
            word += units[n] + ' ';
        }

        return word.trim();
    }

    if (integer === 0) return 'Zero ' + currency;

    let words = '';
    let scaleIndex = 0;
    let tempInteger = integer;

    while (tempInteger > 0) {
        const group = tempInteger % 1000;
        if (group > 0) {
            const groupWords = convertGroup(group);
            if (groupWords) {
                words = groupWords + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + ' ' + words;
            }
        }
        tempInteger = Math.floor(tempInteger / 1000);
        scaleIndex++;
    }

    let finalString = words.trim() + ' ' + currency;

    // Add "Only" if no decimals
    if (decimal === 0) {
        finalString += ' Only';
    } else {
        // Handle decimals as Dirhams/Cents depending on currency, defaulting to Dirhams for QAR/AED
        const decimalUnit = (currency === 'QAR' || currency === 'AED') ? 'Dirhams' : 'Cents';
        // Convert decimal part to words too, or just keep as numbers? User request implied "appropriate dirham"
        // Usually it's "And XX Dirhams" or "And XX/100"
        // Let's use words for consistency with "appropriate" request or just "And XX Dirhams"
        finalString += ` and ${decimal} ${decimalUnit} Only`;
    }

    return finalString;
}
