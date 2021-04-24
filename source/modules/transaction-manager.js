module.exports = function(initialTxCount, txQueueSize) {
    const txManager = this;

    // Todo: Timeout mechanism to deal with pending tx that do not fail but never get processed.
    // Could happen for example if the gas price is too low and no miner wants to process it.
    // They will block all following tx with a higher nonce. Need to detect such stuck tx and overwrite them with a new tx with same nonce, that then might get processed.

    const txQueue = [];
    let txCount = initialTxCount;

    txManager.sendTransaction = async function(txObject, options, onTxHashCallback) {
        if (txQueue.length >= txQueueSize) {
            throw Error("Transaction manager transaction queue is full");
        }

        setTxNonceAndEnqueue();

        options.nonce = txObject.nonce;
        return txObject.send(options)
            .on("transactionHash", onTxHashCallback)
            .then(receipt => {
                removeTxObjectFromQueue();
                return receipt;
            }).catch(e => {
                if ("receipt" in e) {
                    removeTxObjectFromQueue();
                }
                else {
                    removeTxObjectFromQueueAndLeaveGap();
                }
                throw e; // Rethrowing the error to the promise chain is intended here.
            });

        function setTxNonceAndEnqueue() {
            if (txQueue.length === 0) {
                txObject.nonce = txCount;
                txQueue.unshift(txObject);
                return;
            }

            const insertIndex = findInsertIndex();
            if (insertIndex < 0) {
                // No gaps, enqueue normally.
                txObject.nonce = txQueue[0].nonce + 1;
                txQueue.unshift(txObject);
                return;
            }

            // Found a gap. Fill the gap.
            txObject.nonce = insertIndex < indexLastElement() ? (txQueue[insertIndex + 1].nonce + 1) : txCount;
            txQueue[insertIndex] = txObject;
        }

        function findInsertIndex() {
            let i = indexLastElement();
            for (i; i >= 0; i--) {
                if (!txQueue[i]) {
                    return i;
                }
            }
            return i;
        }

        function indexLastElement() {
            return txQueue.length - 1;
        }

        function removeTxObjectFromQueue() {
            const index = txQueue.indexOf(txObject);
            txQueue.splice(index, 1);
            updateTxCount();
        }

        function updateTxCount() {
            // Order of tx receipts is not guaranteed the order of the tx sent!
            const nextTxCount = txObject.nonce + 1;
            if (txCount < nextTxCount) {
                txCount = nextTxCount;
            }
        }

        function removeTxObjectFromQueueAndLeaveGap() {
            txQueue[txQueue.indexOf(txObject)] = undefined;
        }
    }
}