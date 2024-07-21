use std::str::FromStr;

use mongodb::{
    bson::{doc, oid::ObjectId, Document},
    Collection,
};
use rocket::futures::TryStreamExt;
use serde::{de::DeserializeOwned, Serialize};

use super::error::ModelError;

pub trait BaseModel<Model>
where
    Model: Clone + DeserializeOwned + Send + Serialize + Sync,
{
    fn collection(&self) -> Collection<Model>;

    async fn create(&self, new_model: &Model) -> Result<Model, ModelError> {
        let result = self.collection().insert_one(new_model).await?;

        let inserted_id = result
            .inserted_id
            .as_object_id()
            .ok_or(ModelError::InsertError)?;

        self.read_by_id(&inserted_id.to_string())
            .await?
            .ok_or(ModelError::InsertError)
    }

    async fn delete_by_filter(&self, filter: Document) -> Result<usize, ModelError> {
        let result = self.collection().delete_many(filter).await?;

        Ok(result.deleted_count as usize)
    }

    async fn delete_by_id(&self, id: &str) -> Result<bool, ModelError> {
        let result = self
            .collection()
            .delete_one(doc! {
                "_id": ObjectId::from_str(id)?,
            })
            .await?;

        Ok(result.deleted_count == 1)
    }

    async fn read_all(&self) -> Result<Vec<Model>, ModelError> {
        let models = self.collection().find(doc! {}).await?.try_collect().await?;

        Ok(models)
    }

    async fn read_by_filter(&self, filter: Document) -> Result<Vec<Model>, ModelError> {
        let models = self.collection().find(filter).await?.try_collect().await?;

        Ok(models)
    }

    async fn read_by_id(&self, id: &str) -> Result<Option<Model>, ModelError> {
        let model = self
            .collection()
            .find_one(doc! {
                "_id": ObjectId::from_str(id)?,
            })
            .await?;

        Ok(model)
    }

    async fn update_by_id(&self, id: &str, updated_model: &Model) -> Result<bool, ModelError> {
        let result = self
            .collection()
            .update_one(
                doc! {
                    "_id": ObjectId::from_str(id)?,
                },
                doc! {
                    "$set": self.update_doc(updated_model)?,
                },
            )
            .await?;

        Ok(result.modified_count == 1)
    }

    fn update_doc(&self, model: &Model) -> Result<Document, ModelError>;
}

#[cfg(test)]
mod tests {
    use std::{collections::HashSet, env::var};

    use dotenvy::dotenv;
    use mongodb::{
        bson::serde_helpers::{
            deserialize_hex_string_from_object_id, serialize_hex_string_as_object_id,
        },
        Client,
    };
    use serde::Deserialize;

    use super::*;

    const TEST_CREATE_COLLECTION_NAME: &'static str = "create_super_heroes";
    const TEST_DELETE_COLLECTION_NAME: &'static str = "delete_super_heroes";
    const TEST_READ_COLLECTION_NAME: &'static str = "read_super_heroes";
    const TEST_UPDATE_COLLECTION_NAME: &'static str = "update_super_heroes";

    #[derive(Clone, Debug, Deserialize, Eq, Hash, PartialEq, Serialize)]
    struct SuperHero {
        has_super_power: bool,
        #[serde(
            deserialize_with = "deserialize_hex_string_from_object_id",
            rename = "_id",
            serialize_with = "serialize_hex_string_as_object_id"
        )]
        id: String,
        name: String,
    }

    struct SuperHeroes {
        collection: Collection<SuperHero>,
    }

    impl BaseModel<SuperHero> for SuperHeroes {
        fn collection(&self) -> mongodb::Collection<SuperHero> {
            self.collection.clone()
        }

        fn update_doc(&self, model: &SuperHero) -> Result<Document, ModelError> {
            Ok(doc! {
                "name": model.name.clone(),
            })
        }
    }

    async fn build_super_heroes(collection_name: &str) -> SuperHeroes {
        dotenv().unwrap();

        let uri = var("TEST_MONGODB_CONNECTION_STRING").unwrap();

        let client = Client::with_uri_str(uri).await.unwrap();

        let database = client.default_database().unwrap();

        let collection = database.collection::<SuperHero>(collection_name);

        collection.drop().await.unwrap();

        SuperHeroes { collection }
    }

    async fn setup_db(super_heroes: &SuperHeroes) -> (SuperHero, SuperHero, SuperHero) {
        let batman = SuperHero {
            has_super_power: false,
            id: ObjectId::new().to_string(),
            name: "Batman".to_string(),
        };

        let superman = SuperHero {
            has_super_power: true,
            id: ObjectId::new().to_string(),
            name: "Superman".to_string(),
        };

        let wonder_woman = SuperHero {
            has_super_power: true,
            id: ObjectId::new().to_string(),
            name: "Wonder Woman".to_string(),
        };

        super_heroes.create(&batman).await.unwrap();
        super_heroes.create(&superman).await.unwrap();
        super_heroes.create(&wonder_woman).await.unwrap();

        (batman, superman, wonder_woman)
    }

    #[tokio::test]
    async fn test_create() {
        let super_heroes = build_super_heroes(TEST_CREATE_COLLECTION_NAME).await;

        let batman = SuperHero {
            has_super_power: false,
            id: ObjectId::new().to_string(),
            name: "Batman".to_string(),
        };

        let create_result = super_heroes.create(&batman).await.unwrap();

        assert_eq!(batman, create_result);
    }

    #[tokio::test]
    async fn test_delete() {
        let super_heroes = build_super_heroes(TEST_DELETE_COLLECTION_NAME).await;

        let (batman, superman, _) = setup_db(&super_heroes).await;

        let delete_by_filter_result = super_heroes
            .delete_by_filter(doc! {
                "has_super_power": false,
            })
            .await
            .unwrap();

        assert_eq!(1, delete_by_filter_result);

        let delete_by_filter_result_none = super_heroes.read_by_id(&batman.id).await.unwrap();

        assert_eq!(None, delete_by_filter_result_none);

        let delete_by_id_result = super_heroes.delete_by_id(&superman.id).await.unwrap();

        assert!(delete_by_id_result);

        let delete_by_id_result_none = super_heroes.read_by_id(&superman.id).await.unwrap();

        assert_eq!(None, delete_by_id_result_none);
    }

    #[tokio::test]
    async fn test_read() {
        let super_heroes = build_super_heroes(TEST_READ_COLLECTION_NAME).await;

        let (batman, superman, wonder_woman) = setup_db(&super_heroes).await;

        let read_all_super_heroes = super_heroes
            .read_all()
            .await
            .unwrap()
            .into_iter()
            .collect::<HashSet<_>>();

        assert_eq!(
            HashSet::from_iter(
                [batman.clone(), superman.clone(), wonder_woman.clone()].into_iter()
            ),
            read_all_super_heroes
        );

        let read_by_filter_super_heroes = super_heroes
            .read_by_filter(doc! {
                "has_super_power": false,
            })
            .await
            .unwrap()
            .into_iter()
            .collect::<HashSet<_>>();

        assert_eq!(
            HashSet::from_iter([batman.clone()].into_iter()),
            read_by_filter_super_heroes
        );

        let read_by_id_super_hero = super_heroes.read_by_id(&batman.id).await.unwrap().unwrap();

        assert_eq!(batman.clone(), read_by_id_super_hero);

        let read_by_id_none = super_heroes
            .read_by_id(&ObjectId::new().to_string())
            .await
            .unwrap();

        assert_eq!(None, read_by_id_none);
    }

    #[tokio::test]
    async fn test_update() {
        let super_heroes = build_super_heroes(TEST_UPDATE_COLLECTION_NAME).await;

        let (batman, _, _) = setup_db(&super_heroes).await;

        let mut robin = batman.clone();

        robin.name = "Robin".to_string();

        let update_by_id_result = super_heroes.update_by_id(&batman.id, &robin).await.unwrap();

        assert!(update_by_id_result);

        let update_by_id_super_hero = super_heroes.read_by_id(&batman.id).await.unwrap().unwrap();

        assert_eq!(robin.name, update_by_id_super_hero.name);
    }
}
