import { Component } from 'react';
import { fetchImages } from 'services/api';

import { Searchbar } from './Searchbar/Searchbar';
import { Section } from './Section/Section';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { ButtonLoadMore } from './ButtonLoadMore/ButtonLoadMore';
import { Modal } from './Modal/Modal';
import { Loader } from './Loader/Loader';

const alertStyle = {
  textAlign: 'center',
  fontSize: 24,
};

export class App extends Component {
  state = {
    query: '',
    page: 1,
    images: [],
    isLoading: false,
    lastPage: 1,
    error: null,
    showModal: false,
    largeImageURL: '',
    noResulst: false,
  };

  // fetch images after submit
  handleSubmit = event => {
    event.preventDefault();
    const query = event.target.elements.query.value;

    if (query === '') {
      alert('Please enter your query');
      return;
    }

    this.setState({
      query: query,
      page: 1,
      isLoading: true,
      noResulst: false,
    });

    const fetchImagesByQuery = async query => {
      try {
        const response = await fetchImages(query, 1);
        this.setState({
          images: response.hits,
          lastPage: Math.ceil(response.totalHits / 12),
        });
        if (response.totalHits === 0) {
          this.setState({ noResulst: true });
        }
      } catch (error) {
        this.setState({ error });
      } finally {
        this.setState({ isLoading: false });
      }
    };
    fetchImagesByQuery(query, 1);
  };

  // fetch more images after click on button "Load more"
  handleLoadMore = () => {
    this.setState({ isLoading: true });
    const { query, page } = this.state;
    const fetchImagesByQuery = async query => {
      try {
        const response = await fetchImages(query, page + 1);
        this.setState(prevState => ({
          images: [...prevState.images, ...response.hits],
          page: prevState.page + 1,
        }));
      } catch (error) {
        this.setState({ error });
      } finally {
        this.setState({ isLoading: false });
      }
    };
    fetchImagesByQuery(query, page + 1);
  };

  // modal open
  onImageClick = largeImageURL => {
    this.setState({ showModal: true, largeImageURL: largeImageURL });
  };

  // modal close
  onClose = () => {
    this.setState({ showModal: false, largeImageURL: '' });
  };

  render() {
    const {
      page,
      images,
      isLoading,
      lastPage,
      error,
      showModal,
      largeImageURL,
      noResults,
    } = this.state;

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridGap: 16,
          paddingBottom: 24,
        }}
      >
        <Searchbar onSubmit={this.handleSubmit} />

        {isLoading && <Loader />}

        {error && (
          <p style={alertStyle}>
            Whoops, something went wrong: {error.message}
          </p>
        )}

        {noResults && (
          <p style={alertStyle}>No images found. Please try another query.</p>
        )}

        <Section>
          <ImageGallery images={images} onImageClick={this.onImageClick} />
        </Section>

        {page < lastPage && !isLoading ? (
          <ButtonLoadMore
            label={'Load more'}
            handleLoadMore={this.handleLoadMore}
          />
        ) : (
          <div style={{ height: 40 }}></div>
        )}

        {showModal && (
          <Modal onClose={this.onClose} largeImageURL={largeImageURL} />
        )}
      </div>
    );
  }
}
