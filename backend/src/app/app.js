import express from 'express';
import cors from 'cors';
import routes from '../routes/routes.js';
import sequelize from '../models/db.js';

class App {
    constructor() {
        this.app = express();
        this.config();
    }

    config() {
        sequelize.sync();
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use('', routes);
    }

    listen(port) {
        this.app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
}

export default new App().app;