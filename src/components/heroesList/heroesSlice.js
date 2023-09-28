import { createSlice, createSelector, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import { useHttp } from "../../hooks/http.hook";

const heroesAdapter = createEntityAdapter();
const initialState = heroesAdapter.getInitialState({
    heroesLoadingStatus: 'idle'
})

export const fetchHeroes = createAsyncThunk(
    'heroes/fetchHeroes',
    async () => {
        const {request} = useHttp();
        return await request("http://localhost:3001/heroes");
    }
)

const heroesSlice = createSlice({
    name: 'heroes', // уникальное название среза slice name
    initialState,
    reducers: {
        heroCreated: (state, action) => {
            // state.heroes.push(action.payload)
            heroesAdapter.addOne(state, action.payload);
        },
        heroDeleted: (state, action) => {
            // state.heroes = state.heroes.filter(item => item.id !== action.payload);
            heroesAdapter.removeOne(state, action.payload);

        }
    },
    extraReducers: (builder) => {
        builder
                                                  //action=> reducer=> state
            .addCase(fetchHeroes.pending, state => {state.heroesLoadingStatus = 'loading'}) // immer c такой конструкцией{} позволяет иммутабить стейт прям в редьюсере, под капотом на самом деле иммутабельности нет и правила не нарушаем 
            .addCase(fetchHeroes.fulfilled, (state, action) => {
                state.heroesLoadingStatus = 'idle';
                heroesAdapter.setAll(state, action.payload)
            })
            .addCase(fetchHeroes.rejected, state => {
                state.heroesLoadingStatus = 'error';
            })
            .addDefaultCase(() => {})
    }
});

const {actions, reducer} = heroesSlice;
export default reducer;

const {selectAll} = heroesAdapter.getSelectors(state => state.heroes);
export const filteredHeroesSelector = createSelector( // createSelector мемоизирует значение и не перерендеривает страницу, если значение не изменилось
        (state) => state.filters.activeFilter,
        selectAll,
        (filter, heroes) => { // heroes получили из selectAll
            if(filter ==='all'){
                return heroes;
            } else {
                return heroes.filter(item => item.element === filter)
            }
        }
    )

export const {
    heroesFetching,
    heroesFetched,
    heroesFetchingError,
    heroCreated,
    heroDeleted
} = actions;