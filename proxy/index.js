const express = require('express');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const ftp = require('basic-ftp');
const cors = require("cors")
const multer = require('multer');
const fs = require('fs');
const path = require('path');
var morgan = require('morgan')
const archiver = require("archiver")

const DATAFILE = "./data.json";
const initialData = require(DATAFILE)

const app = express();
const PORT = process.env.PORT;
const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASSWORD = process.env.FTP_PASSWORD;

const SECRET_KEY = process.env.SECRET_KEY;
FTP_ROOT_DIR = process.env.FTP_ROOT_DIR

app.use(cors())
app.use(bodyParser.json());
app.use(morgan('tiny'))

const services = initialData.services
const users = initialData.users;

const getServiceById = (id) => services.find(s => s.id == id)
const getServiceByUsername = (name) => users.find(u => u.name == name)
const getUserById = (id) => users.find(u => u.id == id)
const getUserByUsername = (username) => users.find(u => u.username == username)

const createUser = (payload) => {
  return new Promise((resolve, reject) => {
    if(payload.is_admin) {
      payload.role = "admin"
    } else payload.role = "user"
    payload.id = users.length + 1
    users.push(payload)
    fs.writeFile(DATAFILE, JSON.stringify({ services, users }), {}, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
      resolve(payload)
    })
  })
}
const createService = (payload) => {
  return new Promise((resolve, reject) => {
    payload.id = services.length + 1
    services.push(payload)
    fs.writeFile(DATAFILE, JSON.stringify({ services, users }), {}, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
      resolve(payload)
    })
  })
}

const saltRounds = 10;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY
};

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  const user = users.find(user => user.username === jwt_payload.username);
  if (user) {
    return done(null, user);
  } else {
    return done(null, false);
  }
}));

app.use(passport.initialize());

const authenticate = passport.authenticate('jwt', { session: false });

users.forEach(user => {
  bcrypt.hash(user.password, saltRounds, (err, hash) => {
    if (err) {
      console.error(err);
    } else {
      user.hash = hash;
    }
  });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.hash);
  if (match) {
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '10d' });
    res.json({ token_type: 'Bearer', access_token: token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/drive', authenticate,  async (req, res) => {
  let folder = ""
  if(req.user.role === "admin") {
    if(req.query?.folder && typeof req.query?.folder === 'string') {
      folder += (req.query?.folder.startsWith('/') ? req.query?.folder : "/" + req.query?.folder )
    } else folder = "/"
  } else {
    const service = getServiceById(req.user.id_service)
    if(!service) {
      res.status(403).json({ error: "Accès à ce service refusé !" });
      return
    }
    folder = service.folder
    if(req.query?.folder && typeof req.query?.folder === 'string') {
      folder += (req.query?.folder.startsWith('/') ? req.query?.folder : "/" + req.query?.folder )
    }
  }
  console.log("Look into ", folder)
  const client = new ftp.Client();
  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD
    });

    const list = await client.list(folder);
    // list.sort((a))
    console.log(list.length)

    res.json({
      total: list.length,
      data: list
    });
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message });
  } finally {
    client.close();
  }
});


app.get('/services', authenticate,  async (req, res) => {
  try {
    res.json({
      total: services.length,
      data: services.map(item => ({ ...item, users: users.filter(u => u.id_service == item.id ) }) )
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
}
});


app.get('/services/:id', authenticate,  async (req, res) => {
  const service = getServiceById(req.params.id)
  service.users = users.filter(u => u.id_service === service.id)

  try {
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
}
});


app.post('/services', authenticate,  async (req, res) => {
  try {
    console.log(req.body)
    if(!req.body.name) return res.status(400).json({ error: "Nom manquant" })

    let existing_service = getServiceByUsername(req.body.name)
    console.log("existing_service ", existing_service)
    if(existing_service) return res.status(400).json({ error: "Un service possède déjà ce nom" })
    const u = await createService(req.body)
    console.log("Created service ", u)
    if(u) {
      return res.json("ok")
    } else {
      res.status(400).json({ error: "Vérifiez le formulaire " })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message });
  }
});

app.put('/services/:id', authenticate,  async (req, res) => {
  const service = getServiceById(req.params.id)
  if(!service) {
    return res.status(404).json({ error: "None trouvé" });

  }
  let my_users = service.users
  for(uid of req.body.users) {
    const u = getUserById(uid)
    if(u) {
      u.id_service = service.id
    }
  }

    res.json({ "status": "ok" });

  });

app.get('/users', authenticate,  async (req, res) => {
  try {
    res.json({ total: users.length, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
  }

});

app.get('/users/me', authenticate,  async (req, res) => {
  try {
    res.json({ ...req.user, service: getServiceById(req.user.id_service) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {

  }
});


app.post('/users', authenticate,  async (req, res) => {
  try {
    console.log(req.body)
    if(!req.body.username) return res.status(400).json({ error: "Email manquant" })

    let existing_user = getUserByUsername(req.body.username)
    console.log("existing_user ", existing_user)
    if(existing_user) return res.status(400).json({ error: "Mail déjà utilisé" })
    const u = await createUser(req.body)
    console.log("Created user ", u)
    if(u) {
      return res.json("ok")
    } else {
      res.status(400).json({ error: "Vérifiez le formulaire " })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message });
  }
});


const upload = multer({ dest: 'uploads/' });

app.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    console.log("body ", req.body.basePath, req.file, req.files)
    const service = getServiceById(req.user.id_service)
    if(!service) {
      res.status(403).json({ error: "Accès à ce service refusé !" });
      return
    }
    let basePath = req.body.basePath
    if(!basePath) {
      res.status(400).json({ error: "Chemein requis !" });
    }
    basePath = service.folder + (basePath.startsWith('/') ? basePath : '/' + basePath)
    const { path: tempPath, originalname } = req.file;
    const targetPath = path.join(__dirname, "uploads", originalname);
    
    fs.rename(tempPath, targetPath, async err => {
      if (err) return res.status(500).json({ error: err.message });
  
      const client = new ftp.Client();
      try {
        await client.access({
          host: FTP_HOST,
          user: FTP_USER,
          password: FTP_PASSWORD
        });
  
        console.log("totla basePath :: ", basePath)
        console.log("totla targetPath :: ", targetPath)
        await client.uploadFrom(targetPath, `${basePath}/${originalname}`);
        res.json({ success: true });
      } catch (err) {
        console.log("ERR ", err)
        res.status(500).json({ error: err.message });
      } finally {
        client.close();
        fs.unlink(targetPath, (err) => {
          if (err) console.error(err);
        });
      }
    });
    
  } catch (error) {
    console.error("eerrrooorr ", error)
    res.status(500).json({ error: err.message });
  }
});



app.post('/download', authenticate, async (req, res) => {
  const service = getServiceById(req.user.id_service)
  if(!service) {
    res.status(403).json({ error: "Accès à ce service refusé !" });
    return
  }

  console.log("req.body ", req.body)
  let { files: fileList } = req.body; // expect a comma-separated list of filenames
  fileList = fileList.map(f => service.folder + (f.startsWith('/') ? f : '/' + f) )
  if(fileList.length === 0) {
    res.status(400).json({ error: "Sélectionnez au moins un fichier à télécharger !" });
  }

  console.log("DOWNLOAD fileList :: ", fileList)
  const client = new ftp.Client();
  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD
    });

    if (fileList.length === 1) {
      const filePath = fileList[0];
      console.log("ONLY one file ", filePath)
      const fileName = filePath.split("/").slice(-1)[0]
      const tempPath = path.join(__dirname, 'downloads', fileName);
      console.log("tempPath ", tempPath)
      console.log("Before DOWNLOADED")
      await client.downloadTo(tempPath, filePath);
      console.log("DOWNLOADED")
      res.download(tempPath, (err) => {
        fs.unlink(tempPath, (err) => {
          if (err) console.error(err);
        });
      });
    } else {
      const archive = archiver('zip', { zlib: { level: 9 } });
      res.attachment('files.zip');
      archive.pipe(res);

      for (const filePath of fileList) {
        const fileName = filePath.split("/").slice(-1)[0]
        const tempPath = path.join(__dirname, 'downloads', fileName);
        await client.downloadTo(tempPath, filePath);
        archive.file(tempPath, { name: fileName });
      }

      await archive.finalize();
      archive.on('end', () => {
        for (const filePath of fileList) {
          const tempPath = path.join(__dirname, 'downloads', fileName);
          const fileName = filePath.split("/").slice(-1)[0]
          fs.unlink(tempPath, (err) => {
            if (err) console.error(err);
          });
        }
      });
    }
  } catch (err) {
    console.log("err ", err)
    res.status(500).json({ error: err.message });
  } finally {
    client.close();
  }
});






app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
