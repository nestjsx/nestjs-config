export default {
    __provide: 'set_by_manual',
    test: parseInt(process.env.PORT) || 3000,
};
