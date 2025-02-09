p3xr.ng.component('p3xrMainKeyZset', {
    template: require('./p3xr-main-key-zset.html'),
    bindings: {
        p3xrValue: '=',
        p3xrKey: '<',
        p3xrResponse: '<',
    },
    controller: function ($scope, p3xrCommon, p3xrSocket, p3xrDialogJsonView, p3xrDialogKeyNewOrSet, $rootScope) {
        const generateHashFromRedisSortedSet = (value,) => {

            const generatedValue = [];
            let savedValue = undefined;
            for (let item of value) {
                if (savedValue === undefined) {
                    savedValue = item;
                } else {
                    generatedValue.push([
                        parseFloat(item),
                        savedValue
                    ])
                    savedValue = undefined
                }
            }
            return generatedValue;
        }

        let lastVal
        $scope.$watch('$ctrl.p3xrValue', (newVal, oldVal) => {
            if (newVal !== lastVal) {
                //console.warn('p3xr main key zset update')
                lastVal = newVal
                this.generatedValue = generateHashFromRedisSortedSet(this.p3xrValue)
            }
        })


        this.showJson = (options) => {
            const {value} = options;
            p3xrDialogJsonView.show({
                value: value
            })
        }

        this.setTableStyles = (options) => {
            return p3xrCommon.setTableZebraStyles(options)
        }

        this.addZSet = async (options) => {
            try {
                await p3xrDialogKeyNewOrSet.show({
                    type: 'append',
                    $event: options.$event,
                    model: {
                        type: 'zset',
                        key: this.p3xrKey
                    }
                })
                $rootScope.$broadcast('p3x-refresh-key');
            } catch (e) {
                p3xrCommon.generalHandleError(e)
            }
        }


        this.deleteZSet = async (options) => {
            try {
                await p3xrCommon.confirm({
                    event: options.$event,
                    message: p3xr.strings.confirm.deleteZSetMember,
                })
                await p3xrSocket.request({
                    action: 'key-zset-delete-member',
                    payload: {
                        key: this.p3xrKey,
                        value: options.member,
                    }
                })
                $rootScope.$broadcast('p3x-refresh-key');
            } catch (e) {
                p3xrCommon.generalHandleError(e)
            }
        }

        this.editValue = async (options) => {
            try {
                const {member} = options
                await p3xrDialogKeyNewOrSet.show({
                    type: 'edit',
                    $event: options.$event,
                    model: {
                        type: 'zset',
                        score: options.score,
                        value: member,
                        key: this.p3xrKey
                    }
                })
                $rootScope.$broadcast('p3x-refresh-key');
            } catch (e) {
                p3xrCommon.generalHandleError(e)
            }
        }


    }
})

