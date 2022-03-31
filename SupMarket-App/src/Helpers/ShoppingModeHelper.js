import { Toast } from "native-base";

/**
 * Récupère le montant total du panier contenu dans le context du mode courses
 *
 * @export
 * @param {*} context du mode courses
 * @returns Montant total du panier
 */
export function getBasketAmount (context){
    const [articles] = context;
    var basketAmount = 0;

    articles.articles.forEach(x => basketAmount += x.number * x.Price);
    return parseFloat(basketAmount.toFixed(2));
  };

/**
 * Nombre d'articles du panier dans le context du mode courses
 *
 * @export
 * @param {*} context du mode courses
 * @returns nombre total d'articles
 */
export function getBasketArticlesNumber(context){
    const [articles, dispatch] = context;
    var number = 0;

    articles.articles.forEach(value => number += value.number);

    return number;
  }

/**
 * Récupère les articles du context
 *
 * @export
 * @param {*} context du mode courses
 * @returns les articles
 */
export function getBasketArticles(context){
  const [articles] = context;

  return articles.articles;
  }

/**
 * Ajout d'un article dans le panier du mode courses
 *
 * @export
 * @param {*} context du mode courses
 * @param {*} article à ajouter
 */
export function addArticleToBasket(context,article){
    const [articles, dispatch] = context;
    dispatch({ type: "ADD_ARTICLE", article: article })
  }

/**
 * Supprime une occurence d'un article du panier dans le mode courses
 *
 * @export 
 * @param {*} context du mode courses
 * @param {*} article à décrémenter
 */
export function decreasesArticle(context,article){
  const [articles, dispatch] = context;

  articles && articles.articles && articles.articles.filter(value => value.ID === article.ID).length > 0 ?
    dispatch({ type: "REMOVE_ONE_ARTICLE", article: article })
    :
    Toast.show({
      text: "Cet article n'est pas présent dans votre liste.",
      duration: 3000
    })
}

/**
 * Récupère quantité de l'article présent dans le panier
 *
 * @export
 * @param {*} context du mode courses
 * @param {*} id de l'article
 * @returns
 */
export function getBasketArticleQuantity(context, id){
  const [articles] = context;
  var article = articles.articles.find(value => value.ID == id);
  return article ? article.number : 0;
}

/**
 * Supprimer l'article du panier 
 *
 * @export
 * @param {*} context du mode courses
 * @param {*} article à supprimer
 */
export function removeArticle(context, article){
  const [articles, dispatch] = context;

  dispatch({ type: "REMOVE_ALL_ARTICLE", article: article })
}

/**
 *
 *
 * @export
 * @param {*} category
 * @returns
 */
export function defineArticleThumbnail(category){
  switch (category) {
    case "Produits laitiers":
      return "cheese";
    case "Légumes":
      return "carrot";
    case "Céréales":
      return "bread-slice";
    case "Fruits":
      return "apple-alt";
    default:
      return "no";
  }
}