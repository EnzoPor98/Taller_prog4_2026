// Error de negocio con codigo HTTP asociado.
// Los servicios lo lanzan y los controladores lo traducen a la respuesta.
export class ErrorHttp extends Error {
    constructor(status, mensaje) {
        super(mensaje);
        this.status = status;
    }
}

export const responderError = (res, error, mensajePorDefecto) => {
    if (error instanceof ErrorHttp) {
        return res.status(error.status).json({ mensaje: error.message });
    }
    console.error(mensajePorDefecto, error);
    return res.status(500).json({ mensaje: mensajePorDefecto });
};
