//require libarary
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3024;
//db
const { MongoClient, ServerApiVersion, Collection, ObjectId, Double } = require('mongodb');
const uri = process.env.mongodb_url;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//middleware
app.use(cors());
app.use(express.json());

const runMongoDB = async () => {
  try {
    //collections
    const postCollection = client.db("socialMedia").collection("post");
    const usersCollection = client.db("socialMedia").collection("user");
    const likerCollection = client.db("socialMedia").collection("liker");
    const dislikerCollection = client.db("socialMedia").collection("disliker");
    const commentCollection = client.db("socialMedia").collection("comment");
    const aboutCollection = client.db("socialMedia").collection("about");

    app.post("/posts", async (req, res) => {
      const postData = req.body;
      const insertData = await postCollection.insertOne(postData);
      res.status(201).send(insertData);
    });

    app.get("/posts", async (req, res) => {
      const getData = await postCollection.find().toArray();
      res.status(201).send(getData);
    });

    app.get("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const postData = await postCollection.findOne(filter);
      res.status(201).send(postData);
    })

    app.get("/topPosts", async (req, res) => {
      const topPostsData = await postCollection.find().sort({ likes: -1 }).limit(3).toArray();
      res.status(201).send(topPostsData);
    })

    //>>---------------->> Post like start <<---------------<<

    app.put("/postLike", async (req, res) => {
      let postId = req.query.postId;
      let likerData = req.body;
      let filter = { _id: ObjectId(postId) };
      let likeFind = await postCollection.findOne(filter);
      if (likeFind.likes) {
        let likeCountIncrees = likeFind.likes + 1;
        const updateDocument = {
          $set: {
            likes: likeCountIncrees,
          }
        }
        const updateLike = await postCollection.updateOne(filter, updateDocument, { upsert: true });
        const insertLikerData = await likerCollection.insertOne(likerData);
        res.status(201).send(updateLike);
      } else {

        const updateDocument = {
          $set: {
            likes: Double(1)
          }
        }
        const updateLike = await postCollection.updateOne(filter, updateDocument, { upsert: true });
        const insertLikerData = await likerCollection.insertOne(likerData);
        res.status(201).send(updateLike);
      }

    })

    //>>---------------->> Post like end <<------------<<

    //>>---------------->> Post postWithdrawLike start <<---------------<<

    app.put("/postWithdrawLike", async (req, res) => {
      let postId = req.query.postId;
      let filter = { _id: ObjectId(postId) };
      let likeFind = await postCollection.findOne(filter);
      if (likeFind.likes) {
        let likeCountIncrees = likeFind.likes - 1;
        const updateDocument = {
          $set: {
            likes: likeCountIncrees,
          }
        }
        const updateLike = await postCollection.updateOne(filter, updateDocument, { upsert: true });
        const deleteLikerData = await likerCollection.deleteOne({ likeId: postId });
        res.status(201).send(updateLike);
      }

    })

    //>>---------------->> Post postWithdrawLike end <<------------<<



    //>>---------------->> Post dislike start <<---------------<<

    app.put("/postDisLike", async (req, res) => {
      let postId = req.query.postId;
      let disLikerData = req.body;
      let filter = { _id: ObjectId(postId) };
      let disLikeFind = await postCollection.findOne(filter);
      if (disLikeFind.disLikes) {
        let disLikeCountIncrees = disLikeFind.disLikes + 1;
        const updateDocument = {
          $set: {
            disLikes: disLikeCountIncrees,
          }
        }
        const updateDisLike = await postCollection.updateOne(filter, updateDocument, { upsert: true });
        const insertDisLikerData = await dislikerCollection.insertOne(disLikerData);
        res.status(201).send(updateDisLike);
      } else {

        const updateDocument = {
          $set: {
            disLikes: Double(1)
          }
        }
        const updateLike = await postCollection.updateOne(filter, updateDocument, { upsert: true });
        const insertLikerData = await dislikerCollection.insertOne(disLikerData);
        res.status(201).send(updateLike);
      }

    })

    //>>---------------->> Post dislike end <<------------<<


    //>>---------------->> Post postWithdrawDisike start <<---------------<<

    app.put("/postWithdrawDisike", async (req, res) => {
      let postId = req.query.postId;

      let filter = { _id: ObjectId(postId) };
      let dislikeFind = await postCollection.findOne(filter);
      if (dislikeFind.disLikes) {
        let dislikeCountIncrees = dislikeFind.disLikes - 1;
        const updateDocument = {
          $set: {
            disLikes: dislikeCountIncrees,
          }
        }
        const updateLike = await postCollection.updateOne(filter, updateDocument, { upsert: true });
        const deleteLikerData = await dislikerCollection.deleteOne({ likeId: postId });
        res.status(201).send(updateLike);
      }

    })

    //>>---------------->> Post postWithdrawDisike end <<------------<<




    //get liker data
    app.get("/likerData", async (req, res) => {
      const email = req.query.email;
      const id = req.query.id;
      const filter = { $and: [{ likerEmail: email }, { likeId: id }] };
      const likersData = await likerCollection.findOne(filter);
      res.status(201).send(likersData);
    })

    //get disliker data
    app.get("/dislikerData", async (req, res) => {
      const email = req.query.email;
      const id = req.query.id;
      const filter = { $and: [{ dislikerEmail: email }, { dislikeId: id }] };
      const dislikersData = await dislikerCollection.findOne(filter);
      res.status(201).send(dislikersData);
    })

    //insert user informations

    app.post("/users", async (req, res) => {
      const userPostData = req.body;
      const insertUsers = await usersCollection.insertOne(userPostData);
      res.status(201).send(insertUsers);
    });
    //save comment

    app.post("/comments", async (req, res) => {
      const commentsData = req.body;
      const result = await commentCollection.insertOne(commentsData);
      res.status(201).send(result);
    })
    //get comments
    app.get("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { postId: id };
      const result = await commentCollection.find(filter).sort({ _id: -1 }).toArray();
      res.status(201).send(result);
    })

    //get about information
    app.get("/about", async (req, res) => {
      const result = await aboutCollection.find().toArray();
      res.status(201).send(result);
    });
    //get one about information

    app.get("/about/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await aboutCollection.findOne(filter);
      res.status(201).send(result);
    });

    //update one about information

    app.put("/update-about-information/:id", async (req, res) => {
      const id = req.params.id;
      const aboutUpdateInfo = req.body;
      const { name, email, address, university, profession, profile } = aboutUpdateInfo;
      // console.log( id ); 
      const filter = { _id: ObjectId(id) };
      const aboutUpdateDocs = {
        $set: {
          name: name,
          email: email,
          address: address,
          university: university,
          profession: profession,
          profile: profile,
        }
      };
      const options = { upsert: true };

      const result = await aboutCollection.updateOne(filter, aboutUpdateDocs, options);
      //  console.log(result);
      res.status(201).send(result);
    })

    //----??
  } catch (error) {
    console.log(error);
  }
  finally {
    //ok
  }
}
runMongoDB().catch(error => console.log(error));


app.get("/", (req, res) => {
  res.send("This is social media ")
})

//port 
app.listen(port, (req, res) => {
  console.log(`Social media server running on port number : ${port}`);
})
