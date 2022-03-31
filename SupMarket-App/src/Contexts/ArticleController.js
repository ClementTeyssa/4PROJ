import React, { useReducer, useMemo } from 'react'
import PropTypes from 'prop-types';

const initialState = {
    articles: [],
    beacon: undefined
  };

const initialContext = [{ ...initialState }, () =>{}];

export const ArticleContext = React.createContext(initialContext);

// Reducer qui gère les actions sur les articles du client
const reducer = (state, action) => {
    switch(action.type){
        case "ADD_ARTICLE":
            // On vérifie si l'article est déjà présent dans le state
            if(state.articles.find(value => value.ID == action.article.ID)){
                // On incrémente de un l'article
                state.articles.map(value => value.ID == action.article.ID ? value.number++ : null);
                var newState = { ...state, articles: [...state.articles] };
            } else {
                // On ajoute l'article au state
                action.article.number = 1;
                console.log("EJOJDEIJDI");
                var newState = { ...state, articles: [...state.articles, action.article] };
            }

            return newState;
        case "REMOVE_ONE_ARTICLE":
            //On cherche l'article à supprimer
            var article = state.articles.find(value => value.ID == action.article.ID);
            
            if(article.number > 1){
                // Si il y en a plus de 1 alors on décremente le nombre
                state.articles.map(value => value.ID == action.article.ID ? value.number-- : null);
                var newState = { ...state, articles: [...state.articles] };
            } else {
                //Sinon on le supprime de la liste
                var newState = { ...state, articles: state.articles.filter(value => value.ID != action.article.ID)}
            }

            return newState;
        case "REMOVE_ALL_ARTICLE":
            //On supprime l'occurence de l'article du context
            var newArticles = state.articles.filter(value => value.ID != action.article.ID);
            return { ...state, articles: newArticles };
        default:
            throw new Error("Action not valid")
    }
};


export function ArticleController(props){
    const [articleState, dispatch] = useReducer(reducer, initialState);
    const memoizedValue = useMemo(() => [articleState, dispatch], [articleState]);

    return (
        <ArticleContext.Provider value={memoizedValue}>
            {props.children}
        </ArticleContext.Provider>
    );
}

ArticleController.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired
};