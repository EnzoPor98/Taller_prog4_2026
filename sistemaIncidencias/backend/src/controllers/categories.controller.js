const getCategories = async (req, res) => {
    const categorias = [
        { id: 1, descripcion: 'Hardware', activo: true },
        { id: 2, descripcion: 'Software', activo: true },
        { id: 3, descripcion: 'Redes', activo: true },
    ];


    // ejemplo de respuesta a un get
    return res.status(200).json(categorias);
};


// Dentro de cada metodo usar la logica de manejo de datos necesaria
const getCategory = async (req, res) => {
    console.log('getCategory');
    return res.status(200).json(null);

};

const createCategory = async (req, res) => {
    console.log('createCategory');
    return res.status(200).json(null);

};

const updateCategory = async (req, res) => {
    console.log('updateCategory');
    return res.status(200).json(null);

};

const deleteCategory = async (req, res) => {
    console.log('deleteCategory');
    return res.status(200).json(null);

};

export {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};